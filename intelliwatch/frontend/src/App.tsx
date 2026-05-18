import { useState } from 'react';
import { useSocket } from './hooks/useSocket';
import { useSim } from './hooks/useSim';
import { useAppStore } from './store/useAppStore';
import { ThemeProvider } from './contexts/ThemeContext';
import { Topbar } from './components/Topbar';
import { Sidebar } from './components/Sidebar';
import { FactoryFloor } from './components/FactoryFloor';
import { OperatorView } from './components/views/OperatorView';
import { SupervisorView } from './components/views/SupervisorView';
import { OwnerView } from './components/views/OwnerView';
import { NodeBuilderView } from './components/nodebuilder/NodeBuilderView';
import { WorkspaceView } from './components/views/WorkspaceView';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer } from './components/Toast';
import { OfflineOverlay } from './components/OfflineOverlay';

function AppInner() {
  useSocket();
  useSim();
  const { activeTab } = useAppStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showFactory, setShowFactory] = useState(false);

  return (
    <div
      className="h-screen w-screen overflow-hidden flex flex-col select-none transition-theme"
      style={{ background: 'var(--bg-page)' }}
    >
      {/* ── Fixed top bar (full width) ───────────────────────────────────── */}
      <Topbar onSettings={() => setShowSettings(true)} />

      {/* ── Body: sidebar + main content ─────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden mt-12">

        {/* Left sidebar */}
        <Sidebar
          onSettings={() => setShowSettings(true)}
          onToggleFactory={() => setShowFactory(v => !v)}
          showFactory={showFactory}
        />

        {/* Main content — shifts right of sidebar (64px collapsed) */}
        <main className="flex-1 overflow-hidden pl-16 transition-all duration-250">

          {/* Scrollable dashboard views */}
          {activeTab !== 'nodebuilder' && activeTab !== 'workspace' && (
            <div className="h-full overflow-y-auto overflow-x-hidden">
              <div className="p-4 max-w-[1920px] mx-auto pb-6">

                {/* Factory Floor panel (toggleable) */}
                {showFactory && (
                  <div className="mb-4">
                    <FactoryFloor onClose={() => setShowFactory(false)} />
                  </div>
                )}

                {activeTab === 'operator'   && <OperatorView />}
                {activeTab === 'supervisor' && <SupervisorView />}
                {activeTab === 'owner'      && <OwnerView />}
              </div>
            </div>
          )}

          {/* Node builder — full height, no outer scroll */}
          {activeTab === 'nodebuilder' && <NodeBuilderView />}

          {/* Workspace — full height, own scroll */}
          {activeTab === 'workspace' && <WorkspaceView />}
        </main>
      </div>

      {/* Modals & overlays */}
      <OfflineOverlay />
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
