import React from 'react';
import ToolsLibrary from './components/ToolsLibrary';
import './styles.css';

class SafeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    if (/ResizeObserver loop/.test(error.message)) {
      this.setState({ hasError: false });
    }
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

function App() {
  return (
    <SafeErrorBoundary>
      <div className="App" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <header className="App-header" style={{ width: '100%', backgroundColor: 'black', color: 'white', padding: '16px 0', textAlign: 'center' }}>
          🤖 flochart.ai
        </header>
        <ToolsLibrary />
      </div>
    </SafeErrorBoundary>
  );
}

export default App;