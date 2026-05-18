import { useEffect, useState } from 'react';
import { cn, fmt } from '../lib/utils';
import { useAppStore, type Tab } from '../store/useAppStore';
import { useTheme } from '../contexts/ThemeContext';
import {
  Wrench, ClipboardList, Briefcase, Network, LayoutDashboard,
  Settings, Sun, Moon, ChevronRight, ChevronLeft,
  Factory, Timer, LogOut, IdCard, MapPin, Clock,
} from 'lucide-react';
import { Tooltip } from './Tooltip';

const NAV_ITEMS: { id: Tab; label: string; Icon: React.ElementType; color: string }[] = [
  { id: 'operator',    label: 'Operator',     Icon: Wrench,          color: '#00DFB8' },
  { id: 'supervisor',  label: 'Supervisor',   Icon: ClipboardList,   color: '#4B9FFF' },
  { id: 'owner',       label: 'Owner',        Icon: Briefcase,       color: '#A466F5' },
  { id: 'nodebuilder', label: 'Node Builder', Icon: Network,         color: '#FFB020' },
  { id: 'workspace',   label: 'Workspace',    Icon: LayoutDashboard, color: '#F97316' },
];

/** Logged-in user — borrowed from the INTELLIWATCH design's rail profile. */
const USER = {
  name:     'Prabhu Kumar',
  initials: 'PK',
  title:    'Plant Operations Lead',
  empId:    'EMP-OPR-01-17',
  unit:     'Machining Shop A · Bengaluru',
  shift:    'Morning · 06:00–14:00',
};

interface SidebarProps {
  onSettings: () => void;
  onToggleFactory?: () => void;
  showFactory?: boolean;
}

export function Sidebar({ onSettings, onToggleFactory, showFactory }: SidebarProps) {
  const { activeTab, setTab, shiftStart } = useAppStore();
  const { theme, toggleTheme, isDark } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [elapsed, setElapsed] = useState('00:00:00');
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const tick = () => setElapsed(fmt.duration(Date.now() - shiftStart));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [shiftStart]);

  const w = expanded ? 220 : 64;

  return (
    <>
    <aside
      className="sidebar-surface fixed left-0 top-12 bottom-0 z-40 flex flex-col transition-all duration-250 overflow-hidden select-none"
      style={{ width: w }}
    >
      {/* ── Expand/Collapse toggle ──────────────────────────────────────────── */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="absolute -right-3 top-5 z-10 w-6 h-6 rounded-full flex items-center justify-center
                   transition-all duration-150 hover:scale-110"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--card-shadow)',
          color: 'var(--text-tertiary)',
        }}
        title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {expanded ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>

      {/* ── Navigation items ───────────────────────────────────────────────── */}
      <nav className="flex-1 flex flex-col gap-1 pt-4 px-2">
        {NAV_ITEMS.map(({ id, label, Icon, color }) => {
          const active = activeTab === id;
          const btn = (
            <button
              onClick={() => setTab(id)}
              title={expanded ? undefined : label}
              className={cn(
                'relative flex items-center gap-3 rounded-xl transition-all duration-150',
                'text-left overflow-hidden whitespace-nowrap',
                expanded ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center',
              )}
              style={{
                background: active
                  ? isDark
                    ? `rgba(${hexToRgb(color)}, 0.12)`
                    : `rgba(${hexToRgb(color)}, 0.10)`
                  : 'transparent',
                color: active ? color : 'var(--text-tertiary)',
                border: active
                  ? `1px solid rgba(${hexToRgb(color)}, 0.25)`
                  : '1px solid transparent',
                boxShadow: active ? `0 0 16px rgba(${hexToRgb(color)}, 0.10)` : undefined,
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)';
                }
              }}
            >
              {/* Active left bar */}
              {active && (
                <span
                  className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
                  style={{ background: color }}
                />
              )}

              <Icon
                size={18}
                className="flex-shrink-0"
                style={{ marginLeft: expanded ? 4 : 0 }}
              />

              {expanded && (
                <span className="text-[12px] font-medium tracking-wide">
                  {label}
                </span>
              )}
            </button>
          );
          return !expanded ? (
            <Tooltip key={id} content={label} side="right">
              {btn}
            </Tooltip>
          ) : (
            <div key={id}>{btn}</div>
          );
        })}
      </nav>

      {/* ── Divider ────────────────────────────────────────────────────────── */}
      <div className="mx-3 divider" />

      {/* ── Factory floor toggle ───────────────────────────────────────────── */}
      {onToggleFactory && (
        <div className="px-2 py-1">
          <button
            onClick={onToggleFactory}
            title={!expanded ? 'Factory Floor' : undefined}
            className={cn(
              'w-full flex items-center gap-3 rounded-xl px-0 py-2.5 transition-all duration-150',
              expanded ? 'px-3' : 'justify-center',
            )}
            style={{
              background: showFactory
                ? (isDark ? 'rgba(249,115,22,0.12)' : 'rgba(249,115,22,0.09)')
                : 'transparent',
              color: showFactory ? '#F97316' : 'var(--text-tertiary)',
              border: showFactory ? '1px solid rgba(249,115,22,0.25)' : '1px solid transparent',
            }}
            onMouseEnter={e => {
              if (!showFactory) {
                (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={e => {
              if (!showFactory) {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)';
              }
            }}
          >
            <Factory size={18} className="flex-shrink-0" />
            {expanded && <span className="text-[12px] font-medium">Factory Floor</span>}
          </button>
        </div>
      )}

      {/* ── Shift elapsed ──────────────────────────────────────────────────── */}
      <div className="px-2 py-1">
        <div
          className={cn(
            'flex items-center gap-2 rounded-xl py-2.5 transition-theme',
            expanded ? 'px-3' : 'justify-center px-0',
          )}
          style={{
            background: 'rgba(255,176,32,0.07)',
            border: '1px solid rgba(255,176,32,0.15)',
          }}
          title={!expanded ? `Elapsed: ${elapsed}` : undefined}
        >
          <Timer size={15} style={{ color: '#FFB020', flexShrink: 0 }} />
          {expanded && (
            <div className="flex flex-col leading-none gap-0.5">
              <span className="text-[9px] font-medium tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                ELAPSED
              </span>
              <span className="font-mono text-[11px] font-bold tabular-nums" style={{ color: '#FFB020' }}>
                {elapsed}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom actions ─────────────────────────────────────────────────── */}
      <div className="px-2 pb-4 flex flex-col gap-1">
        <div className="mx-1 divider mb-1" />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={!expanded ? `Switch to ${isDark ? 'light' : 'dark'} mode` : undefined}
          className={cn(
            'flex items-center gap-3 rounded-xl py-2 transition-all duration-150',
            expanded ? 'px-3' : 'justify-center px-0',
          )}
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)';
          }}
        >
          {isDark
            ? <Sun size={16} className="flex-shrink-0" />
            : <Moon size={16} className="flex-shrink-0" />
          }
          {expanded && (
            <span className="text-[12px] font-medium">
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>

        {/* Settings */}
        <button
          onClick={onSettings}
          title={!expanded ? 'Settings' : undefined}
          className={cn(
            'flex items-center gap-3 rounded-xl py-2 transition-all duration-150',
            expanded ? 'px-3' : 'justify-center px-0',
          )}
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)';
          }}
        >
          <Settings size={16} className="flex-shrink-0" />
          {expanded && <span className="text-[12px] font-medium">Settings</span>}
        </button>

        {/* ── Logged-in user profile ─────────────────────────────────────── */}
        <div className="mx-1 divider my-1" />
        <button
          onClick={() => setShowProfile(v => !v)}
          title={!expanded ? USER.name : undefined}
          className={cn(
            'flex items-center gap-2.5 rounded-xl py-1.5 transition-all duration-150',
            expanded ? 'px-2' : 'justify-center px-0',
          )}
          style={{ background: showProfile ? 'var(--surface-2)' : 'transparent' }}
          onMouseEnter={e => { if (!showProfile) (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
          onMouseLeave={e => { if (!showProfile) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <span
            className="relative flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold"
            style={{ background: 'linear-gradient(135deg, #00DFB8, #4B9FFF)', color: '#06121F' }}
          >
            {USER.initials}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
              style={{ background: '#2DD898', border: '2px solid var(--sidebar-bg)' }}
            />
          </span>
          {expanded && (
            <>
              <div className="flex flex-col leading-tight min-w-0 flex-1 text-left">
                <span className="text-[12px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {USER.name}
                </span>
                <span className="text-[10px] truncate" style={{ color: 'var(--text-tertiary)' }}>
                  {USER.title}
                </span>
              </div>
              <ChevronRight size={13} className="flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
            </>
          )}
        </button>
      </div>
    </aside>

    {/* ── Profile popover — fixed so it escapes the rail's overflow:hidden ── */}
    {showProfile && (
      <>
        <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
        <div
          className="fixed z-50 rounded-xl overflow-hidden animate-fade-up"
          style={{
            left: w + 8,
            bottom: 14,
            width: 252,
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            boxShadow: 'var(--card-shadow-lg)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-3.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <span
              className="relative flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-[15px] font-bold"
              style={{ background: 'linear-gradient(135deg, #00DFB8, #4B9FFF)', color: '#06121F' }}
            >
              {USER.initials}
              <span
                className="absolute bottom-0 right-0 w-3 h-3 rounded-full"
                style={{ background: '#2DD898', border: '2px solid var(--card-bg)' }}
              />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {USER.name}
              </p>
              <p className="text-[10px] truncate" style={{ color: 'var(--text-tertiary)' }}>
                {USER.title}
              </p>
            </div>
          </div>

          {/* Info rows */}
          <div className="px-3.5 py-2.5 flex flex-col gap-2">
            <ProfileRow Icon={IdCard} label="Employee ID" value={USER.empId} mono />
            <ProfileRow Icon={MapPin}  label="Unit"        value={USER.unit} />
            <ProfileRow Icon={Clock}   label="Shift"       value={USER.shift} />
          </div>

          {/* Actions */}
          <div className="p-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => { toggleTheme(); }}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[12px] transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
              {isDark ? 'Light mode' : 'Dark mode'}
            </button>
            <button
              onClick={() => { setShowProfile(false); onSettings(); }}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[12px] transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <Settings size={14} />
              Settings
            </button>
            <button
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[12px] transition-colors"
              style={{ color: '#FF4F6A' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,79,106,0.10)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      </>
    )}
    </>
  );
}

function ProfileRow({
  Icon, label, value, mono,
}: { Icon: React.ElementType; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={13} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--text-tertiary)' }} />
      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
        <p
          className={cn('text-[11px] truncate', mono && 'font-mono')}
          style={{ color: 'var(--text-secondary)' }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/** Convert #RRGGBB to "R, G, B" string for rgba() usage */
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}
