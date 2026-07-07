import { useEffect, useMemo, useRef, useState } from 'react';
import { Building2, Check, ChevronDown } from 'lucide-react';
import { workspaceOptions } from '../../config/navigation';
import { useAppStore } from '../../store/useAppStore';

export default function WorkspaceSelector() {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('enterprise');
  const ref = useRef<HTMLDivElement>(null);
  const { orgProfile, isDemoMode } = useAppStore();

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const selected = useMemo(
    () => workspaceOptions.find((option) => option.id === selectedId) ?? workspaceOptions[0],
    [selectedId]
  );

  const workspaceName = orgProfile.companyName || selected.label;
  const workspaceDescription = isDemoMode
    ? 'Demo dataset active'
    : orgProfile.industrySector || selected.description;

  return (
    <div ref={ref} className="workspace-selector">
      <button
        type="button"
        className="workspace-selector-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Select workspace"
      >
        <span className="workspace-selector-icon" aria-hidden="true">
          <Building2 size={15} />
        </span>
        <span className="workspace-selector-copy">
          <span className="workspace-selector-label">{workspaceName}</span>
          <span className="workspace-selector-meta">{workspaceDescription}</span>
        </span>
        <ChevronDown size={14} className={open ? 'workspace-selector-chevron open' : 'workspace-selector-chevron'} aria-hidden="true" />
      </button>

      {open && (
        <div className="workspace-selector-menu" role="menu" aria-label="Workspace options">
          {workspaceOptions.map((option) => {
            const active = option.id === selectedId;

            return (
              <button
                key={option.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                className={active ? 'workspace-selector-option active' : 'workspace-selector-option'}
                onClick={() => {
                  setSelectedId(option.id);
                  setOpen(false);
                }}
              >
                <span>
                  <span className="workspace-selector-option-label">{option.label}</span>
                  <span className="workspace-selector-option-meta">{option.description}</span>
                </span>
                {active && <Check size={14} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}