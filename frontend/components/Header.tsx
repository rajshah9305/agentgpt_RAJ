export function Header() {
  return (
    <header className="text-center py-8">
      <div className="animate-float">
        <h1 className="text-5xl font-bold text-gray-900 mb-3 text-shadow">
          🤖 AgentGPT
        </h1>
        <p className="text-xl text-gray-700 mb-2">
          Powered by <span className="gradient-text font-semibold">Cerebras</span> & <span className="gradient-text font-semibold">Sambanova</span>
        </p>
        <p className="text-sm text-gray-600">
          Autonomous AI Agents for Complex Tasks
        </p>
      </div>
    </header>
  );
}
