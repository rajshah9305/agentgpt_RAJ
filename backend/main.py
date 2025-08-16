# main.py - FastAPI Backend for AgentGPT
from fastapi import FastAPI, HTTPException, Depends, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
try:
    # Try Pydantic v2 first
    from pydantic import BaseModel, Field
    PYDANTIC_V2 = True
except ImportError:
    # Fallback to Pydantic v1
    from pydantic import BaseModel, Field
    PYDANTIC_V2 = False

from typing import List, Optional, Dict, Any, Union
from enum import Enum
import httpx
import uuid
import json
import logging
import csv
import io
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get environment variables
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# FastAPI app
app = FastAPI(
    title="AgentGPT API",
    description="Autonomous AI Agents powered by Cerebras & Sambanova",
    version="1.0.0",
    debug=DEBUG
)

# CORS middleware with environment-based configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enums
class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class AgentStatus(str, Enum):
    IDLE = "idle"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    STOPPED = "stopped"

class AIProvider(str, Enum):
    CEREBRAS = "cerebras"
    SAMBANOVA = "sambanova"

class LogType(str, Enum):
    INFO = "info"
    ERROR = "error"
    WARNING = "warning"

class ExportFormat(str, Enum):
    JSON = "json"
    CSV = "csv"
    TXT = "txt"

# Pydantic Models
class AgentConfig(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    goal: str = Field(..., min_length=1, max_length=1000)
    provider: AIProvider
    model: str
    api_key: str = Field(..., min_length=1)
    max_iterations: int = Field(default=5, ge=1, le=10)
    temperature: float = Field(default=0.7, ge=0.0, le=1.0)

class AgentResponse(BaseModel):
    id: str
    name: str
    goal: str
    provider: str
    model: str
    status: AgentStatus
    created_at: datetime
    updated_at: datetime

class TaskResponse(BaseModel):
    id: str
    agent_id: str
    text: str
    status: TaskStatus
    result: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

class LogResponse(BaseModel):
    id: str
    agent_id: str
    message: str
    log_type: LogType
    created_at: datetime

class AgentExecutionRequest(BaseModel):
    config: AgentConfig

class DownloadRequest(BaseModel):
    format: ExportFormat = ExportFormat.JSON
    include_logs: bool = True
    include_tasks: bool = True
    include_config: bool = True

# AI Provider Configurations
AI_PROVIDERS = {
    AIProvider.CEREBRAS: {
        "name": "Cerebras Inference",
        "base_url": "https://api.cerebras.ai/v1",
        "models": [
            "llama-4-scout-17b-16e-instruct",
            "llama3.1-8b",
            "llama-3.3-70b",
            "qwen-3-32b",
            "deepseek-r1-distill-llama-70b"
        ]
    },
    AIProvider.SAMBANOVA: {
        "name": "Sambanova Cloud",
        "base_url": "https://api.sambanova.ai/v1",
        "models": [
            "Llama-4-Maverick-17B-128E-Instruct",
            "Llama-4-Scout-17B-16E-Instruct",
            "Meta-Llama-3.1-405B-Instruct",
            "deepseek-v3"
        ]
    }
}

# Global storage for active agents and their data
active_agents: Dict[str, Dict] = {}
agent_data: Dict[str, Dict] = {}

# AI Provider Integration
class AIClient:
    def __init__(self, provider: AIProvider, api_key: str):
        self.provider = provider
        self.api_key = api_key
        self.config = AI_PROVIDERS[provider]
        
    async def chat_completion(self, messages: List[Dict], model: str, temperature: float = 0.7) -> str:
        """Make a chat completion request to the AI provider"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": 2000,
            "stream": False
        }
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            try:
                response = await client.post(
                    f"{self.config['base_url']}/chat/completions",
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                
                data = response.json()
                return data["choices"][0]["message"]["content"]
                
            except httpx.HTTPError as e:
                logger.error(f"HTTP error calling {self.provider.value}: {e}")
                # Return a fallback response instead of raising an error
                return f"AI provider temporarily unavailable. Error: {str(e)}"
            except Exception as e:
                logger.error(f"Unexpected error calling {self.provider.value}: {e}")
                return f"Unexpected error occurred: {str(e)}"

    async def execute_agent_task(self, goal: str, task_description: str, model: str, temperature: float = 0.7) -> str:
        """Execute a specific agent task using AI"""
        messages = [
            {
                "role": "system",
                "content": f"You are an AI agent working on the goal: {goal}. Provide detailed, accurate, and helpful information. Be thorough in your research and analysis."
            },
            {
                "role": "user",
                "content": f"Please execute this task: {task_description}. Provide a comprehensive response with relevant details, facts, and insights."
            }
        ]
        
        try:
            result = await self.chat_completion(messages, model, temperature)
            return result
        except Exception as e:
            logger.error(f"Error executing agent task: {e}")
            return f"Task execution failed: {str(e)}"

# Export and Download Functions
def generate_execution_summary(agent_id: str) -> Dict[str, Any]:
    """Generate a comprehensive execution summary for an agent"""
    if agent_id not in agent_data:
        return {}
    
    data = agent_data[agent_id]
    tasks = data.get('tasks', [])
    logs = data.get('logs', [])
    
    # Calculate statistics
    total_tasks = len(tasks)
    completed_tasks = len([t for t in tasks if t['status'] == 'completed'])
    failed_tasks = len([t for t in tasks if t['status'] == 'failed'])
    success_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    # Generate summary
    summary = {
        "execution_summary": {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "failed_tasks": failed_tasks,
            "success_rate": f"{success_rate:.1f}%",
            "execution_time": data.get('execution_time', 'N/A'),
            "final_status": data.get('status', 'unknown')
        },
        "key_findings": [],
        "recommendations": []
    }
    
    # Extract key findings from completed tasks
    for task in tasks:
        if task['status'] == 'completed' and task['result']:
            summary["key_findings"].append({
                "task": task['text'],
                "result": task['result'][:200] + "..." if len(task['result']) > 200 else task['result']
            })
    
    # Generate recommendations based on execution
    if failed_tasks > 0:
        summary["recommendations"].append("Review failed tasks and adjust agent parameters")
    if success_rate < 50:
        summary["recommendations"].append("Consider reducing task complexity or adjusting AI model parameters")
    if success_rate >= 80:
        summary["recommendations"].append("Agent performed well. Consider increasing task complexity for next run")
    
    return summary

def export_to_json(agent_id: str, include_logs: bool = True, include_tasks: bool = True, include_config: bool = True) -> str:
    """Export agent data to JSON format"""
    if agent_id not in agent_data:
        return json.dumps({"error": "Agent not found"})
    
    data = agent_data[agent_id]
    export_data = {}
    
    if include_config:
        export_data["agent_config"] = data.get('config', {})
    
    if include_tasks:
        export_data["tasks"] = data.get('tasks', [])
    
    if include_logs:
        export_data["logs"] = data.get('logs', [])
    
    export_data["execution_summary"] = generate_execution_summary(agent_id)
    export_data["export_timestamp"] = datetime.now(timezone.utc).isoformat()
    
    return json.dumps(export_data, indent=2, default=str)

def export_to_csv(agent_id: str, include_logs: bool = True, include_tasks: bool = True, include_config: bool = True) -> str:
    """Export agent data to CSV format"""
    if agent_id not in agent_data:
        return "Error: Agent not found"
    
    data = agent_data[agent_id]
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(["AgentGPT Export", "Generated on: " + datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")])
    writer.writerow([])
    
    # Agent configuration
    if include_config and 'config' in data:
        writer.writerow(["Agent Configuration"])
        config = data['config']
        writer.writerow(["Name", config.get('name', 'N/A')])
        writer.writerow(["Goal", config.get('goal', 'N/A')])
        writer.writerow(["Provider", config.get('provider', 'N/A')])
        writer.writerow(["Model", config.get('model', 'N/A')])
        writer.writerow(["Max Iterations", config.get('max_iterations', 'N/A')])
        writer.writerow(["Temperature", config.get('temperature', 'N/A')])
        writer.writerow([])
    
    # Tasks
    if include_tasks and 'tasks' in data:
        writer.writerow(["Tasks"])
        writer.writerow(["ID", "Text", "Status", "Result", "Created At", "Updated At"])
        for task in data['tasks']:
            writer.writerow([
                task.get('id', ''),
                task.get('text', ''),
                task.get('status', ''),
                task.get('result', '')[:100] + "..." if task.get('result') and len(task.get('result', '')) > 100 else task.get('result', ''),
                task.get('created_at', ''),
                task.get('updated_at', '')
            ])
        writer.writerow([])
    
    # Logs
    if include_logs and 'logs' in data:
        writer.writerow(["Execution Logs"])
        writer.writerow(["Timestamp", "Type", "Message"])
        for log in data['logs']:
            writer.writerow([
                log.get('created_at', ''),
                log.get('log_type', ''),
                log.get('message', '')
            ])
        writer.writerow([])
    
    # Summary
    summary = generate_execution_summary(agent_id)
    if summary:
        writer.writerow(["Execution Summary"])
        writer.writerow(["Metric", "Value"])
        for key, value in summary.get('execution_summary', {}).items():
            writer.writerow([key.replace('_', ' ').title(), value])
        writer.writerow([])
        
        if summary.get('key_findings'):
            writer.writerow(["Key Findings"])
            for finding in summary['key_findings']:
                writer.writerow([finding['task'], finding['result']])
            writer.writerow([])
        
        if summary.get('recommendations'):
            writer.writerow(["Recommendations"])
            for rec in summary['recommendations']:
                writer.writerow([rec])
    
    return output.getvalue()

def export_to_txt(agent_id: str, include_logs: bool = True, include_tasks: bool = True, include_config: bool = True) -> str:
    """Export agent data to plain text format"""
    if agent_id not in agent_data:
        return "Error: Agent not found"
    
    data = agent_data[agent_id]
    output = []
    
    # Header
    output.append("=" * 80)
    output.append("AGENTGPT EXECUTION REPORT")
    output.append("=" * 80)
    output.append(f"Generated on: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')}")
    output.append("")
    
    # Agent configuration
    if include_config and 'config' in data:
        output.append("AGENT CONFIGURATION")
        output.append("-" * 40)
        config = data['config']
        output.append(f"Name: {config.get('name', 'N/A')}")
        output.append(f"Goal: {config.get('goal', 'N/A')}")
        output.append(f"Provider: {config.get('provider', 'N/A')}")
        output.append(f"Model: {config.get('model', 'N/A')}")
        output.append(f"Max Iterations: {config.get('max_iterations', 'N/A')}")
        output.append(f"Temperature: {config.get('temperature', 'N/A')}")
        output.append("")
    
    # Tasks
    if include_tasks and 'tasks' in data:
        output.append("TASKS EXECUTION")
        output.append("-" * 40)
        for i, task in enumerate(data['tasks'], 1):
            output.append(f"Task {i}: {task.get('text', 'N/A')}")
            output.append(f"Status: {task.get('status', 'N/A')}")
            if task.get('result'):
                output.append(f"Result: {task.get('result', 'N/A')}")
            output.append(f"Created: {task.get('created_at', 'N/A')}")
            output.append("")
    
    # Logs
    if include_logs and 'logs' in data:
        output.append("EXECUTION LOGS")
        output.append("-" * 40)
        for log in data['logs']:
            output.append(f"[{log.get('created_at', 'N/A')}] {log.get('log_type', 'INFO').upper()}: {log.get('message', 'N/A')}")
        output.append("")
    
    # Summary
    summary = generate_execution_summary(agent_id)
    if summary:
        output.append("EXECUTION SUMMARY")
        output.append("-" * 40)
        for key, value in summary.get('execution_summary', {}).items():
            output.append(f"{key.replace('_', ' ').title()}: {value}")
        output.append("")
        
        if summary.get('key_findings'):
            output.append("KEY FINDINGS")
            output.append("-" * 40)
            for finding in summary['key_findings']:
                output.append(f"• {finding['task']}")
                output.append(f"  {finding['result']}")
                output.append("")
        
        if summary.get('recommendations'):
            output.append("RECOMMENDATIONS")
            output.append("-" * 40)
            for rec in summary['recommendations']:
                output.append(f"• {rec}")
            output.append("")
    
    output.append("=" * 80)
    return "\n".join(output)

# API Endpoints
@app.get("/")
async def root():
    return {
        "message": "AgentGPT API",
        "version": "1.0.0",
        "providers": list(AI_PROVIDERS.keys())
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": "in-memory"
    }

@app.get("/providers")
async def get_providers():
    """Get available AI providers and their models"""
    return AI_PROVIDERS

@app.post("/agents", response_model=AgentResponse)
async def create_agent(request: AgentExecutionRequest, background_tasks: BackgroundTasks):
    """Create and start a new agent"""
    agent_id = str(uuid.uuid4())
    
    # Validate provider and model
    if request.config.provider not in AI_PROVIDERS:
        raise HTTPException(status_code=400, detail="Invalid AI provider")
    
    if request.config.model not in AI_PROVIDERS[request.config.provider]["models"]:
        raise HTTPException(status_code=400, detail="Invalid model for selected provider")
    
    # Store agent data with API key
    agent_data[agent_id] = {
        'config': {
            'name': request.config.name,
            'goal': request.config.goal,
            'provider': request.config.provider.value,
            'model': request.config.model,
            'api_key': request.config.api_key,
            'max_iterations': request.config.max_iterations,
            'temperature': request.config.temperature
        },
        'tasks': [],
        'logs': [],
        'status': 'idle',
        'created_at': datetime.now(timezone.utc),
        'updated_at': datetime.now(timezone.utc)
    }
    
    # Create agent response
    return AgentResponse(
        id=agent_id,
        name=request.config.name,
        goal=request.config.goal,
        provider=request.config.provider.value,
        model=request.config.model,
        status=AgentStatus.IDLE,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )

@app.get("/agents")
async def list_agents():
    """List all agents"""
    agents = []
    for agent_id, data in agent_data.items():
        agents.append({
            "id": agent_id,
            "name": data['config']['name'],
            "goal": data['config']['goal'],
            "provider": data['config']['provider'],
            "model": data['config']['model'],
            "status": data['status'],
            "created_at": data['created_at'],
            "updated_at": data['updated_at']
        })
    return agents

@app.get("/agents/{agent_id}")
async def get_agent(agent_id: str):
    """Get agent details"""
    if agent_id not in agent_data:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    data = agent_data[agent_id]
    return {
        "id": agent_id,
        "name": data['config']['name'],
        "goal": data['config']['goal'],
        "provider": data['config']['provider'],
        "model": data['config']['model'],
        "status": data['status'],
        "created_at": data['created_at'],
        "updated_at": data['updated_at']
    }

@app.get("/agents/{agent_id}/tasks")
async def get_agent_tasks(agent_id: str):
    """Get tasks for a specific agent"""
    if agent_id not in agent_data:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    return agent_data[agent_id].get('tasks', [])

@app.get("/agents/{agent_id}/logs")
async def get_agent_logs(agent_id: str):
    """Get logs for a specific agent"""
    if agent_id not in agent_data:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    return agent_data[agent_id].get('logs', [])

@app.get("/agents/{agent_id}/summary")
async def get_agent_summary(agent_id: str):
    """Get execution summary for a specific agent"""
    if agent_id not in agent_data:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    return generate_execution_summary(agent_id)

@app.post("/agents/{agent_id}/execute")
async def execute_agent(agent_id: str):
    """Execute an agent with real AI API calls"""
    if agent_id not in agent_data:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    data = agent_data[agent_id]
    config = data['config']
    
    # Create AI client
    ai_client = AIClient(config['provider'], config['api_key'])
    
    # Define tasks based on the agent's goal
    goal = config['goal']
    tasks = [
        f"Research and analyze: {goal}",
        f"Gather comprehensive information about: {goal}",
        f"Provide detailed insights and findings about: {goal}",
        f"Summarize key points and recommendations for: {goal}",
        f"Generate final comprehensive report about: {goal}"
    ]
    
    # Update agent status
    data['status'] = 'running'
    data['execution_start'] = datetime.now(timezone.utc)
    
    try:
        for i, task_text in enumerate(tasks[:config['max_iterations']]):
            # Create task entry
            task_id = str(uuid.uuid4())
            task = {
                'id': task_id,
                'text': task_text,
                'status': 'running',
                'created_at': datetime.now(timezone.utc),
                'updated_at': datetime.now(timezone.utc)
            }
            
            if 'tasks' not in data:
                data['tasks'] = []
            data['tasks'].append(task)
            
            # Add log entry
            log = {
                'id': str(uuid.uuid4()),
                'agent_id': agent_id,
                'message': f"Starting task: {task_text}",
                'log_type': 'info',
                'created_at': datetime.now(timezone.utc)
            }
            
            if 'logs' not in data:
                data['logs'] = []
            data['logs'].append(log)
            
            # Execute task with AI
            try:
                result = await ai_client.execute_agent_task(
                    goal=goal,
                    task_description=task_text,
                    model=config['model'],
                    temperature=config['temperature']
                )
                
                # Update task as completed
                task['status'] = 'completed'
                task['result'] = result
                task['updated_at'] = datetime.now(timezone.utc)
                
                # Add completion log
                completion_log = {
                    'id': str(uuid.uuid4()),
                    'agent_id': agent_id,
                    'message': f"Completed task: {task_text}",
                    'log_type': 'info',
                    'created_at': datetime.now(timezone.utc)
                }
                data['logs'].append(completion_log)
                
            except Exception as e:
                # Update task as failed
                task['status'] = 'failed'
                task['result'] = f"Task failed: {str(e)}"
                task['updated_at'] = datetime.now(timezone.utc)
                
                # Add error log
                error_log = {
                    'id': str(uuid.uuid4()),
                    'agent_id': agent_id,
                    'message': f"Task failed: {task_text} - {str(e)}",
                    'log_type': 'error',
                    'created_at': datetime.now(timezone.utc)
                }
                data['logs'].append(error_log)
        
        # Update final status
        data['status'] = 'completed'
        data['execution_end'] = datetime.now(timezone.utc)
        
        # Calculate execution time
        if 'execution_start' in data and 'execution_end' in data:
            duration = data['execution_end'] - data['execution_start']
            minutes = int(duration.total_seconds() // 60)
            seconds = int(duration.total_seconds() % 60)
            data['execution_time'] = f"{minutes}m {seconds}s"
        
        # Add completion log
        completion_log = {
            'id': str(uuid.uuid4()),
            'agent_id': agent_id,
            'message': f"Agent execution completed successfully. Generated {len([t for t in data['tasks'] if t['status'] == 'completed'])} tasks.",
            'log_type': 'info',
            'created_at': datetime.now(timezone.utc)
        }
        data['logs'].append(completion_log)
        
        return {
            "message": "Agent execution completed successfully",
            "agent_id": agent_id,
            "tasks_completed": len([t for t in data['tasks'] if t['status'] == 'completed']),
            "tasks_failed": len([t for t in data['tasks'] if t['status'] == 'failed']),
            "execution_time": data.get('execution_time', 'N/A')
        }
        
    except Exception as e:
        data['status'] = 'failed'
        error_log = {
            'id': str(uuid.uuid4()),
            'agent_id': agent_id,
            'message': f"Agent execution failed: {str(e)}",
            'log_type': 'error',
            'created_at': datetime.now(timezone.utc)
        }
        
        if 'logs' not in data:
            data['logs'] = []
        data['logs'].append(error_log)
        
        raise HTTPException(status_code=500, detail=f"Agent execution failed: {str(e)}")

# Download and Export Endpoints
@app.post("/agents/{agent_id}/download")
async def download_agent_data(agent_id: str, request: DownloadRequest):
    """Download agent data in various formats"""
    if agent_id not in agent_data:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    data = agent_data[agent_id]
    agent_name = data['config']['name'].replace(' ', '_').lower()
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    
    if request.format == ExportFormat.JSON:
        content = export_to_json(agent_id, request.include_logs, request.include_tasks, request.include_config)
        filename = f"{agent_name}_export_{timestamp}.json"
        media_type = "application/json"
    elif request.format == ExportFormat.CSV:
        content = export_to_csv(agent_id, request.include_logs, request.include_tasks, request.include_config)
        filename = f"{agent_name}_export_{timestamp}.csv"
        media_type = "text/csv"
    elif request.format == ExportFormat.TXT:
        content = export_to_txt(agent_id, request.include_logs, request.include_tasks, request.include_config)
        filename = f"{agent_name}_export_{timestamp}.txt"
        media_type = "text/plain"
    else:
        raise HTTPException(status_code=400, detail="Unsupported export format")
    
    return StreamingResponse(
        io.StringIO(content),
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.get("/agents/{agent_id}/download/{format}")
async def download_agent_data_simple(agent_id: str, format: ExportFormat):
    """Simple download endpoint with default settings"""
    if agent_id not in agent_data:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    data = agent_data[agent_id]
    agent_name = data['config']['name'].replace(' ', '_').lower()
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    
    if format == ExportFormat.JSON:
        content = export_to_json(agent_id, True, True, True)
        filename = f"{agent_name}_export_{timestamp}.json"
        media_type = "application/json"
    elif format == ExportFormat.CSV:
        content = export_to_csv(agent_id, True, True, True)
        filename = f"{agent_name}_export_{timestamp}.csv"
        media_type = "text/csv"
    elif format == ExportFormat.TXT:
        content = export_to_txt(agent_id, True, True, True)
        filename = f"{agent_name}_export_{timestamp}.txt"
        media_type = "text/plain"
    else:
        raise HTTPException(status_code=400, detail="Unsupported export format")
    
    return StreamingResponse(
        io.StringIO(content),
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)