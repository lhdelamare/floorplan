import React, { useState, useEffect, useRef } from 'react';
import {
  MousePointer,
  Hand,
  PenTool,
  Trash2,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Download,
  SaveAll,
  Upload,
  Copy,
  Plus,
  Info,
  Split,
  RotateCw,
  Type,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Sun,
  Moon,
  Printer,
  Save,
  Scissors,
  Clipboard
} from 'lucide-react';
import type { Wall, CanvasItem, LayoutState, Project, Floor, EditorTool } from './types';
import './App.css';

// Pre-defined furniture presets (dimensions in centimeters)
const CATALOG_ITEMS = [
  // Básicos
  { name: 'Porta de Giro', type: 'door', width: 80, depth: 10, color: '#f8fafc', icon: 'door', category: 'basics' },
  { name: 'Porta de Correr', type: 'door', width: 120, depth: 8, color: '#f8fafc', icon: 'door_slide', category: 'basics' },
  { name: 'Janela Blindex', type: 'window', width: 120, depth: 15, color: '#38bdf8', icon: 'window', category: 'basics' },
  { name: 'Escada Reta', type: 'furniture', width: 90, depth: 200, color: '#64748b', icon: 'stairs', category: 'basics' },
  { name: 'Escada Caracol / Giratória', type: 'furniture', width: 150, depth: 150, color: '#64748b', icon: 'stairs_spiral', category: 'basics' },
  { name: 'Escada em L (Curva)', type: 'furniture', width: 150, depth: 150, color: '#64748b', icon: 'stairs_l', category: 'basics' },

  // Sala
  { name: 'Mesa de Jantar', type: 'furniture', width: 160, depth: 90, color: '#b45309', icon: 'table', category: 'living' },
  { name: 'Cadeira Ergonômica', type: 'furniture', width: 50, depth: 50, color: '#3b82f6', icon: 'chair', category: 'living' },
  { name: 'Mesa de Escritório', type: 'furniture', width: 120, depth: 70, color: '#4f46e5', icon: 'table', category: 'living' },
  { name: 'Sofá de Espera', type: 'furniture', width: 160, depth: 80, color: '#06b6d4', icon: 'sofa', category: 'living' },
  { name: 'Rack & TV', type: 'furniture', width: 140, depth: 40, color: '#f43f5e', icon: 'tv', category: 'living' },
  { name: 'Planta Decorativa', type: 'furniture', width: 50, depth: 50, color: '#10b981', icon: 'plant', category: 'living' },

  // Cozinha
  { name: 'Pia de Cozinha', type: 'furniture', width: 120, depth: 60, color: '#14b8a6', icon: 'sink', category: 'kitchen' },
  { name: 'Geladeira Duplex', type: 'furniture', width: 75, depth: 70, color: '#10b981', icon: 'refrigerator', category: 'kitchen' },
  { name: 'Fogão Industrial', type: 'furniture', width: 60, depth: 60, color: '#f59e0b', icon: 'stove', category: 'kitchen' },
  { name: 'Balcão / Armário', type: 'furniture', width: 120, depth: 60, color: '#475569', icon: 'table', category: 'kitchen' },

  // Banheiro
  { name: 'Vaso Sanitário', type: 'furniture', width: 40, depth: 65, color: '#94a3b8', icon: 'toilet', category: 'bathroom' },
  { name: 'Pia de Banheiro (Lavatório)', type: 'furniture', width: 60, depth: 50, color: '#6366f1', icon: 'sink_bath', category: 'bathroom' },
  { name: 'Chuveiro / Box de Banho', type: 'furniture', width: 90, depth: 90, color: '#38bdf8', icon: 'shower', category: 'bathroom' }
];

// Blank project used when starting fresh
const makeBlankProject = (): Project => ({
  name: 'Novo Projeto',
  customPresets: [],
  floors: [
    {
      id: 'floor_1',
      name: 'Pavimento Térreo',
      before: { walls: [], items: [] },
      after: { walls: [], items: [] }
    }
  ]
});

const DEFAULT_PROJECT: Project = {
  name: 'Projeto de Layout Multi-Andar',
  customPresets: [],
  floors: [
    {
      id: 'floor_1',
      name: 'Pavimento Térreo',
      before: {
        walls: [
          { id: 'w1', x1: 100, y1: 100, x2: 700, y2: 100, thickness: 15 },
          { id: 'w2', x1: 700, y1: 100, x2: 700, y2: 500, thickness: 15 },
          { id: 'w3', x1: 700, y1: 500, x2: 100, y2: 500, thickness: 15 },
          { id: 'w4', x1: 100, y1: 500, x2: 100, y2: 100, thickness: 15 }
        ],
        items: [
          { id: 'item1', name: 'Mesa de Reunião', type: 'furniture', x: 400, y: 300, width: 200, depth: 100, rotation: 0, color: '#4f46e5', icon: 'table' },
          { id: 'item2', name: 'Cadeira A', type: 'furniture', x: 350, y: 230, width: 45, depth: 45, rotation: 180, color: '#3b82f6', icon: 'chair' },
          { id: 'item3', name: 'Cadeira B', type: 'furniture', x: 450, y: 230, width: 45, depth: 45, rotation: 180, color: '#3b82f6', icon: 'chair' },
          { id: 'item4', name: 'Cadeira C', type: 'furniture', x: 350, y: 370, width: 45, depth: 45, rotation: 0, color: '#3b82f6', icon: 'chair' },
          { id: 'item5', name: 'Cadeira D', type: 'furniture', x: 450, y: 370, width: 45, depth: 45, rotation: 0, color: '#3b82f6', icon: 'chair' },
          { id: 'item6', name: 'Sofá Recepção', type: 'furniture', x: 200, y: 160, width: 140, depth: 80, rotation: 90, color: '#06b6d4', icon: 'sofa' },
          { id: 'item7', name: 'Porta Entrada', type: 'door', x: 100, y: 440, width: 80, depth: 10, rotation: 90, color: '#f8fafc', icon: 'door' },
          { id: 'item8', name: 'Recepção', type: 'text', x: 230, y: 300, width: 80, depth: 30, rotation: 0, color: '#94a3b8', icon: 'text', fontSize: 18 }
        ]
      },
      after: {
        walls: [
          { id: 'w1', x1: 100, y1: 100, x2: 700, y2: 100, thickness: 15 },
          { id: 'w2', x1: 700, y1: 100, x2: 700, y2: 500, thickness: 15 },
          { id: 'w3', x1: 700, y1: 500, x2: 100, y2: 500, thickness: 15 },
          { id: 'w4', x1: 100, y1: 500, x2: 100, y2: 100, thickness: 15 },
          { id: 'w_divider', x1: 500, y1: 100, x2: 500, y2: 500, thickness: 10 }
        ],
        items: [
          { id: 'item1', name: 'Mesa de Reunião', type: 'furniture', x: 300, y: 300, width: 160, depth: 100, rotation: 90, color: '#4f46e5', icon: 'table' },
          { id: 'item2', name: 'Cadeira A', type: 'furniture', x: 230, y: 250, width: 45, depth: 45, rotation: 90, color: '#3b82f6', icon: 'chair' },
          { id: 'item3', name: 'Cadeira B', type: 'furniture', x: 230, y: 350, width: 45, depth: 45, rotation: 90, color: '#3b82f6', icon: 'chair' },
          { id: 'item4', name: 'Cadeira C', type: 'furniture', x: 370, y: 250, width: 45, depth: 45, rotation: 270, color: '#3b82f6', icon: 'chair' },
          { id: 'item5', name: 'Cadeira D', type: 'furniture', x: 370, y: 350, width: 45, depth: 45, rotation: 270, color: '#3b82f6', icon: 'chair' },
          { id: 'item_new_desk', name: 'Mesa Foco', type: 'furniture', x: 600, y: 250, width: 120, depth: 70, rotation: 0, color: '#8b5cf6', icon: 'table' },
          { id: 'item_new_chair', name: 'Cadeira Executiva', type: 'furniture', x: 600, y: 310, width: 50, depth: 50, rotation: 0, color: '#3b82f6', icon: 'chair' },
          { id: 'item7', name: 'Porta Entrada', type: 'door', x: 100, y: 440, width: 80, depth: 10, rotation: 90, color: '#f8fafc', icon: 'door' },
          { id: 'item_inner_door', name: 'Porta Divisória', type: 'door', x: 500, y: 400, width: 80, depth: 10, rotation: 270, color: '#f8fafc', icon: 'door' },
          { id: 'item8_a', name: 'Sala Reuniões', type: 'text', x: 300, y: 150, width: 120, depth: 30, rotation: 0, color: '#94a3b8', icon: 'text', fontSize: 16 },
          { id: 'item8_b', name: 'Diretoria', type: 'text', x: 600, y: 150, width: 100, depth: 30, rotation: 0, color: '#94a3b8', icon: 'text', fontSize: 16 }
        ]
      }
    }
  ]
};

interface AppUser { id: number; email: string; name: string; }
interface AppProps { user: AppUser; onLogout: () => void; }

export default function App({ user, onLogout }: AppProps) {
  // --- STATE ---
  const [project, setProject] = useState<Project>(DEFAULT_PROJECT);
  const [currentFloorId, setCurrentFloorId] = useState<string>('floor_1');
  const [currentVersion, setCurrentVersion] = useState<'before' | 'after'>('after');
  const [tool, setTool] = useState<EditorTool>('select');
  const [zoom, setZoom] = useState(0.8);
  const [pan, setPan] = useState({ x: 150, y: 100 });
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [snapSize, setSnapSize] = useState(10); // in cm
  const [isSplitView, setIsSplitView] = useState(false);

  // Undo/Redo Stacks
  const [history, setHistory] = useState<Project[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Selection
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null);
  const [selectedWallIds, setSelectedWallIds] = useState<string[]>([]);

  // Dragging states
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  const [isDraggingItem, setIsDraggingItem] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 });

  const [isRotating, setIsRotating] = useState(false);
  const [rotatingItemId, setRotatingItemId] = useState<string | null>(null);

  // Wall drag/edit states
  const [isDraggingWall, setIsDraggingWall] = useState(false);
  const [draggedWallId, setDraggedWallId] = useState<string | null>(null);
  const [wallDragStartOffset, setWallDragStartOffset] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });
  
  const [draggingWallNode, setDraggingWallNode] = useState<{ wallId: string; nodeIndex: 1 | 2 } | null>(null);
  
  const [isDraggingWallCurve, setIsDraggingWallCurve] = useState(false);
  const [draggedWallCurveId, setDraggedWallCurveId] = useState<string | null>(null);

  // Wall Drawing state
  const [drawingWallStart, setDrawingWallStart] = useState<{ x: number; y: number } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Custom furniture form state
  const [newFurniture, setNewFurniture] = useState({
    name: 'Mesa Redonda',
    type: 'furniture' as 'furniture' | 'door' | 'window' | 'text',
    width: 90,
    depth: 90,
    color: '#3b82f6',
    icon: 'table',
    fontSize: 16
  });

  // --- LOCAL INSPECTOR INPUT STATES ---
  // To avoid key jumpiness with controlled React inputs:
  const [localWidthText, setLocalWidthText] = useState('');
  const [localDepthText, setLocalDepthText] = useState('');
  const [localNameText, setLocalNameText] = useState('');
  const [localRotationText, setLocalRotationText] = useState('');
  const [localTextFontSize, setLocalTextFontSize] = useState('');
  const [localThicknessText, setLocalThicknessText] = useState('');
  const [localLengthText, setLocalLengthText] = useState('');
  const [localWallAngleText, setLocalWallAngleText] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isAddFloorModalOpen, setIsAddFloorModalOpen] = useState(false);
  const [newFloorNameInput, setNewFloorNameInput] = useState('');
  const [copyWallsFromFloorInput, setCopyWallsFromFloorInput] = useState<string>('none');
  const [isInspectorExpanded, setIsInspectorExpanded] = useState(true);
  const [confirmActionModal, setConfirmActionModal] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  const [draggedItemsStartPos, setDraggedItemsStartPos] = useState<{ [itemId: string]: { x: number; y: number } }>({});
  const [draggedWallsStartPos, setDraggedWallsStartPos] = useState<{ [wallId: string]: { x1: number; y1: number; x2: number; y2: number } }>({});
  const [isSelectingBox, setIsSelectingBox] = useState(false);
  const [selectionBoxStart, setSelectionBoxStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionBoxEnd, setSelectionBoxEnd] = useState<{ x: number; y: number } | null>(null);

  const [globalPresets, setGlobalPresets] = useState<any[]>([]);

  // Load global custom presets from API on mount
  useEffect(() => {
    const fetchGlobalPresets = async () => {
      try {
        const res = await fetch('/api/presets', { credentials: 'include' });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped = json.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            type: p.type,
            width: Number(p.width),
            depth: Number(p.depth),
            color: p.color,
            icon: p.icon,
            fontSize: p.font_size
          }));
          setGlobalPresets(mapped);
          localStorage.setItem('floorplan_global_presets', JSON.stringify(mapped));
        } else {
          const local = localStorage.getItem('floorplan_global_presets');
          if (local) setGlobalPresets(JSON.parse(local));
        }
      } catch (e) {
        console.error('Error fetching global presets:', e);
        const local = localStorage.getItem('floorplan_global_presets');
        if (local) setGlobalPresets(JSON.parse(local));
      }
    };
    fetchGlobalPresets();
  }, [user]);

  const [catalogCategory, setCatalogCategory] = useState<string>('basics');
  const [customScope, setCustomScope] = useState<'project' | 'global'>('project');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [projectId, setProjectId] = useState<string>(() => 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5));
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [savedProjects, setSavedProjects] = useState<{id: string; name: string; updated_at: string}[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [isSaveAsModalOpen, setIsSaveAsModalOpen] = useState(false);
  const [saveAsNameInput, setSaveAsNameInput] = useState('');

  const [isSavePresetModalOpen, setIsSavePresetModalOpen] = useState(false);
  const [savePresetItem, setSavePresetItem] = useState<CanvasItem | null>(null);
  const [savePresetName, setSavePresetName] = useState('');
  const [savePresetScope, setSavePresetScope] = useState<'project' | 'global'>('project');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('floorplan_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('floorplan_theme', theme);
  }, [theme]);

  // Print Settings
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printFloorsOption, setPrintFloorsOption] = useState<'all' | 'specific'>('all');
  const [printSelectedFloorIds, setPrintSelectedFloorIds] = useState<string[]>([]);
  const [printLayoutsOption, setPrintLayoutsOption] = useState<'before' | 'after' | 'both'>('both');
  const [printBothOrder, setPrintBothOrder] = useState<'sequence' | 'grouped'>('sequence');

  // Clipboard for Copy / Cut / Paste
  const [clipboard, setClipboard] = useState<CanvasItem[]>([]);

  useEffect(() => {
    if (isPrintModalOpen && printSelectedFloorIds.length === 0 && currentFloorId) {
      setPrintSelectedFloorIds([currentFloorId]);
    }
  }, [isPrintModalOpen, currentFloorId]);

  const svgRef1 = useRef<SVGSVGElement | null>(null);
  const svgRef2 = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Current floor & layout selector helper
  const currentFloor = project.floors.find(f => f.id === currentFloorId) || project.floors[0] || DEFAULT_PROJECT.floors[0];
  const currentLayout = currentVersion === 'before' ? currentFloor.before : currentFloor.after;

  // --- INIT: always start with a blank project ---
  useEffect(() => {
    const blank = makeBlankProject();
    setProject(blank);
    setHistory([blank]);
    setHistoryIndex(0);
  }, []);

  // Sync keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'SELECT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // Undo / Redo
      if (isCmdOrCtrl && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }
      if (isCmdOrCtrl && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Save (Server sync)
      if (isCmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveProjectManual();
        return;
      }

      // Duplicate/Clone selection
      if (isCmdOrCtrl && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedItemIds.length > 1) {
          handleCloneMultipleItems();
        } else if (selectedItemId) {
          handleCloneItem(selectedItemId);
        }
        return;
      }

      // Copy selection
      if (isCmdOrCtrl && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopyItems();
        return;
      }

      // Cut selection
      if (isCmdOrCtrl && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        handleCutItems();
        return;
      }

      // Paste selection
      if (isCmdOrCtrl && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handlePasteItems();
        return;
      }

      // Delete Selection
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (selectedItemIds.length > 0) {
          handleDeleteMultipleItems(selectedItemIds);
        } else if (selectedWallIds.length > 0) {
          handleDeleteMultipleWalls(selectedWallIds);
        } else if (selectedItemId) {
          handleDeleteItem(selectedItemId);
        } else if (selectedWallId) {
          handleDeleteWall(selectedWallId);
        }
        return;
      }

      // Escape key (Cancel drawing / select tool)
      if (e.key === 'Escape') {
        e.preventDefault();
        setDrawingWallStart(null);
        setTool('select');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedItemId,
    selectedItemIds,
    selectedWallId,
    selectedWallIds,
    project,
    currentVersion,
    currentFloorId,
    historyIndex,
    history,
    clipboard
  ]);

  // Sync selection local input text properties
  const selectedItem = currentLayout.items.find(item => item.id === selectedItemId);
  const selectedWall = currentLayout.walls.find(wall => wall.id === selectedWallId);

  useEffect(() => {
    if (selectedItem) {
      if (focusedInput !== 'name') setLocalNameText(selectedItem.name);
      if (focusedInput !== 'width') setLocalWidthText(selectedItem.width.toString());
      if (focusedInput !== 'depth') setLocalDepthText(selectedItem.depth.toString());
      if (focusedInput !== 'rotation') setLocalRotationText(selectedItem.rotation.toString());
      if (focusedInput !== 'fontSize') setLocalTextFontSize((selectedItem.fontSize || 16).toString());
    }
  }, [selectedItemId, selectedItem, focusedInput]);

  useEffect(() => {
    if (selectedWall) {
      if (focusedInput !== 'thickness') setLocalThicknessText(selectedWall.thickness.toString());
      const dx = selectedWall.x2 - selectedWall.x1;
      const dy = selectedWall.y2 - selectedWall.y1;
      if (focusedInput !== 'length') {
        const chordLen = Math.hypot(dx, dy);
        setLocalLengthText((chordLen / 100).toFixed(2));
      }
      if (focusedInput !== 'wallAngle') {
        let angleDeg = Math.atan2(dy, dx) * 180 / Math.PI;
        if (angleDeg < 0) angleDeg += 360;
        setLocalWallAngleText(Math.round(angleDeg).toString());
      }
    }
  }, [selectedWallId, selectedWall, focusedInput]);

  useEffect(() => {
    if (!selectedItemId) {
      setSelectedItemIds([]);
    } else if (selectedItemId && !selectedItemIds.includes(selectedItemId)) {
      const relatedIds: string[] = [];
      const primaryItem = currentLayout.items.find(it => it.id === selectedItemId);
      if (primaryItem && primaryItem.groupId) {
        currentLayout.items.forEach(it => {
          if (it.groupId === primaryItem.groupId) {
            relatedIds.push(it.id);
          }
        });
      } else {
        relatedIds.push(selectedItemId);
      }
      setSelectedItemIds(relatedIds);
    }
  }, [selectedItemId]);

  useEffect(() => {
    setSelectedItemId(null);
    setSelectedItemIds([]);
    setSelectedWallId(null);
    setSelectedWallIds([]);
  }, [tool]);


  const handleUpdateMultipleItems = (updatesMap: { [itemId: string]: Partial<CanvasItem> }, saveToHistory: boolean = true) => {
    const updatedItems = currentLayout.items.map(item => {
      if (updatesMap[item.id]) {
        const res = { ...item, ...updatesMap[item.id] };
        if (updatesMap[item.id].groupId === undefined) {
          delete res.groupId;
        }
        return res;
      }
      return item;
    });

    updateCurrentLayout({
      ...currentLayout,
      items: updatedItems
    }, saveToHistory);
  };

  const handleGroupSelectedItems = () => {
    if (selectedItemIds.length < 2) return;
    const newGroupId = 'group_' + Date.now();
    const updatesMap: { [itemId: string]: Partial<CanvasItem> } = {};
    selectedItemIds.forEach(id => {
      updatesMap[id] = { groupId: newGroupId };
    });
    handleUpdateMultipleItems(updatesMap);
  };

  const handleUngroupSelectedItems = () => {
    const updatesMap: { [itemId: string]: Partial<CanvasItem> } = {};
    selectedItemIds.forEach(id => {
      updatesMap[id] = { groupId: undefined };
    });
    handleUpdateMultipleItems(updatesMap);
  };

  const areSelectedItemsGrouped = () => {
    if (selectedItemIds.length < 2) return false;
    const firstGroupId = currentLayout.items.find(it => it.id === selectedItemIds[0])?.groupId;
    if (!firstGroupId) return false;
    return selectedItemIds.every(id => {
      const it = currentLayout.items.find(item => item.id === id);
      return it && it.groupId === firstGroupId;
    });
  };

  const handleUngroupItem = (itemId: string) => {
    const layout = currentVersion === 'before' ? currentFloor.before : currentFloor.after;
    const item = layout.items.find(it => it.id === itemId);
    if (!item || !item.groupId) return;
    
    const targetGroupId = item.groupId;
    const updatesMap: { [itemId: string]: Partial<CanvasItem> } = {};
    layout.items.forEach(it => {
      if (it.groupId === targetGroupId) {
        updatesMap[it.id] = { groupId: undefined };
      }
    });
    handleUpdateMultipleItems(updatesMap);
  };

  const handleUpdateMultipleWalls = (updatesMap: { [wallId: string]: Partial<Wall> }, saveToHistory: boolean = true) => {
    const updatedWalls = currentLayout.walls.map(wall => {
      if (updatesMap[wall.id]) {
        const res = { ...wall, ...updatesMap[wall.id] };
        if (updatesMap[wall.id].groupId === undefined) {
          delete res.groupId;
        }
        return res;
      }
      return wall;
    });

    updateCurrentLayout({
      ...currentLayout,
      walls: updatedWalls
    }, saveToHistory);
  };

  const handleGroupSelectedWalls = () => {
    if (selectedWallIds.length < 2) return;
    const newGroupId = 'group_wall_' + Date.now();
    const updatesMap: { [wallId: string]: Partial<Wall> } = {};
    selectedWallIds.forEach(id => {
      updatesMap[id] = { groupId: newGroupId };
    });
    handleUpdateMultipleWalls(updatesMap);
  };

  const handleUngroupSelectedWalls = () => {
    const updatesMap: { [wallId: string]: Partial<Wall> } = {};
    selectedWallIds.forEach(id => {
      updatesMap[id] = { groupId: undefined };
    });
    handleUpdateMultipleWalls(updatesMap);
  };

  const areSelectedWallsGrouped = () => {
    if (selectedWallIds.length < 2) return false;
    const firstGroupId = currentLayout.walls.find(w => w.id === selectedWallIds[0])?.groupId;
    if (!firstGroupId) return false;
    return selectedWallIds.every(id => {
      const w = currentLayout.walls.find(wall => wall.id === id);
      return w && w.groupId === firstGroupId;
    });
  };

  const handleUngroupWall = (wallId: string) => {
    const layout = currentVersion === 'before' ? currentFloor.before : currentFloor.after;
    const wall = layout.walls.find(w => w.id === wallId);
    if (!wall || !wall.groupId) return;
    
    const targetGroupId = wall.groupId;
    const updatesMap: { [wallId: string]: Partial<Wall> } = {};
    layout.walls.forEach(w => {
      if (w.groupId === targetGroupId) {
        updatesMap[w.id] = { groupId: undefined };
      }
    });
    handleUpdateMultipleWalls(updatesMap);
  };

  // Commit project state changes
  const commitProjectChange = (newProj: Project, saveToHistory: boolean = true) => {
    setProject(newProj);
    localStorage.setItem('floorplan_project_studio_v2', JSON.stringify(newProj));

    if (saveToHistory) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(newProj)));
      
      if (newHistory.length > 40) {
        newHistory.shift();
      }
      
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const updateCurrentLayout = (updatedLayout: LayoutState, saveToHistory: boolean = true) => {
    const updatedFloors = project.floors.map(floor => {
      if (floor.id === currentFloorId) {
        return {
          ...floor,
          [currentVersion]: updatedLayout
        };
      }
      return floor;
    });

    commitProjectChange({
      ...project,
      floors: updatedFloors
    }, saveToHistory);
  };

  // --- HISTORY ACTIONS ---
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevProject = history[prevIndex];
      setProject(prevProject);
      setHistoryIndex(prevIndex);
      localStorage.setItem('floorplan_project_studio_v2', JSON.stringify(prevProject));
      setSelectedItemId(null);
      setSelectedWallId(null);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextProject = history[nextIndex];
      setProject(nextProject);
      setHistoryIndex(nextIndex);
      localStorage.setItem('floorplan_project_studio_v2', JSON.stringify(nextProject));
      setSelectedItemId(null);
      setSelectedWallId(null);
    }
  };

  // --- VERSION ACTIONS ---
  const copyBeforeToAfter = () => {
    setConfirmActionModal({
      title: "Copiar Layout (Antes → Depois)",
      message: "Isso irá substituir completamente o layout 'Depois' pelo layout 'Antes' neste pavimento. Todos os móveis e anotações do 'Depois' serão substituídos. Continuar?",
      onConfirm: () => {
        const updatedFloors = project.floors.map(floor => {
          if (floor.id === currentFloorId) {
            return {
              ...floor,
              after: JSON.parse(JSON.stringify(floor.before))
            };
          }
          return floor;
        });
        commitProjectChange({ ...project, floors: updatedFloors });
      }
    });
  };

  const copyAfterToBefore = () => {
    setConfirmActionModal({
      title: "Copiar Layout (Depois → Antes)",
      message: "Isso irá substituir completamente o layout 'Antes' pelo layout 'Depois' neste pavimento. Todos os móveis e anotações do 'Antes' serão substituídos. Continuar?",
      onConfirm: () => {
        const updatedFloors = project.floors.map(floor => {
          if (floor.id === currentFloorId) {
            return {
              ...floor,
              before: JSON.parse(JSON.stringify(floor.after))
            };
          }
          return floor;
        });
        commitProjectChange({ ...project, floors: updatedFloors });
      }
    });
  };

  // --- FLOOR ACTIONS ---
  const handlePromptAddFloor = () => {
    setNewFloorNameInput(`Pavimento ${project.floors.length + 1}`);
    setCopyWallsFromFloorInput(currentFloorId);
    setIsAddFloorModalOpen(true);
  };

  const handleAddFloorConfirmed = () => {
    const trimmedName = newFloorNameInput.trim();
    if (!trimmedName) {
      alert("Por favor, digite um nome para o pavimento.");
      return;
    }

    const newFloorId = 'floor_' + Date.now();
    let baseBefore: LayoutState = { walls: [], items: [] };
    let baseAfter: LayoutState = { walls: [], items: [] };

    if (copyWallsFromFloorInput !== 'none') {
      const sourceFloor = project.floors.find(f => f.id === copyWallsFromFloorInput);
      if (sourceFloor) {
        baseBefore.walls = JSON.parse(JSON.stringify(sourceFloor.before.walls));
        baseAfter.walls = JSON.parse(JSON.stringify(sourceFloor.after.walls));
      }
    }

    const newFloor: Floor = {
      id: newFloorId,
      name: trimmedName,
      before: baseBefore,
      after: baseAfter
    };

    commitProjectChange({
      ...project,
      floors: [...project.floors, newFloor]
    });
    setCurrentFloorId(newFloorId);
    setSelectedItemId(null);
    setSelectedWallId(null);
    setIsAddFloorModalOpen(false);
  };

  const handleDeleteFloor = (floorId: string) => {
    if (project.floors.length <= 1) {
      alert("Você precisa manter pelo menos um pavimento no projeto.");
      return;
    }
    const floorToDelete = project.floors.find(f => f.id === floorId);
    if (!floorToDelete) return;

    setConfirmActionModal({
      title: "Excluir Pavimento",
      message: `Tem certeza de que deseja excluir o pavimento "${floorToDelete.name}"? Todos os móveis e paredes dele serão apagados permanentemente.`,
      onConfirm: () => {
        const updatedFloors = project.floors.filter(f => f.id !== floorId);
        commitProjectChange({
          ...project,
          floors: updatedFloors
        });
        setCurrentFloorId(updatedFloors[0].id);
        setSelectedItemId(null);
        setSelectedItemIds([]);
        setSelectedWallId(null);
      }
    });
  };

  // --- MATH HELPERS ---
  const snapValue = (val: number) => {
    if (!snapToGrid) return val;
    return Math.round(val / snapSize) * snapSize;
  };

  const getCanvasCoords = (clientX: number, clientY: number, currentSvg: SVGSVGElement | null) => {
    if (!currentSvg) return { x: 0, y: 0 };
    const rect = currentSvg.getBoundingClientRect();
    const x = (clientX - rect.left - pan.x) / zoom;
    const y = (clientY - rect.top - pan.y) / zoom;
    return { x, y };
  };

  const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.hypot(x2 - x1, y2 - y1);
  };

  // Curved Wall Mathematics: Get Bezier control point
  const getWallBezierParams = (wall: Wall) => {
    const { x1, y1, x2, y2, curve = 0 } = wall;
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    
    if (len === 0) {
      return { cx, cy, ctrlX: cx, ctrlY: cy, curveMidX: cx, curveMidY: cy, nx: 0, ny: 0, approxLength: 0, len };
    }

    // Normal vector pointing perpendicular to wall segment chord
    const nx = -dy / len;
    const ny = dx / len;

    // Control point for quadratic curve Q
    const ctrlX = cx + nx * curve;
    const ctrlY = cy + ny * curve;

    // Midpoint of quadratic bezier curve at t = 0.5
    // formula: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
    // at t=0.5: 0.25 * P0 + 0.5 * P1 + 0.25 * P2
    const curveMidX = 0.25 * x1 + 0.5 * ctrlX + 0.25 * x2;
    const curveMidY = 0.25 * y1 + 0.5 * ctrlY + 0.25 * y2;

    // Approximate Arc Length of Bezier curve
    const dist1 = Math.hypot(ctrlX - x1, ctrlY - y1);
    const dist2 = Math.hypot(x2 - ctrlX, y2 - ctrlY);
    const approxLength = (len + dist1 + dist2) / 2;

    return { cx, cy, ctrlX, ctrlY, curveMidX, curveMidY, nx, ny, approxLength, len };
  };

  // --- CLONE & CUSTOM BUILDING ---
  const handleCloneItem = (itemId: string) => {
    const layout = currentVersion === 'before' ? currentFloor.before : currentFloor.after;
    const sourceItem = layout.items.find(it => it.id === itemId);
    if (!sourceItem) return;

    const clonedItem: CanvasItem = {
      ...sourceItem,
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      x: sourceItem.x + 30,
      y: sourceItem.y + 30
    };
    if (clonedItem.groupId) {
      delete clonedItem.groupId;
    }

    const updatedLayout: LayoutState = {
      ...currentLayout,
      items: [...currentLayout.items, clonedItem]
    };
    updateCurrentLayout(updatedLayout);
    setSelectedItemId(clonedItem.id);
    setSelectedItemIds([clonedItem.id]);
    setSelectedWallId(null);
    setTool('select');
  };

  const handleCloneMultipleItems = () => {
    if (selectedItemIds.length === 0) return;
    const newItems: CanvasItem[] = [];
    const newIds: string[] = [];
    
    selectedItemIds.forEach(id => {
      const sourceItem = currentLayout.items.find(it => it.id === id);
      if (sourceItem) {
        const newId = 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        const cloned: CanvasItem = {
          ...sourceItem,
          id: newId,
          x: sourceItem.x + 30,
          y: sourceItem.y + 30
        };
        if (cloned.groupId) {
          delete cloned.groupId;
        }
        newItems.push(cloned);
        newIds.push(newId);
      }
    });

    const updatedLayout: LayoutState = {
      ...currentLayout,
      items: [...currentLayout.items, ...newItems]
    };
    updateCurrentLayout(updatedLayout);
    setSelectedItemIds(newIds);
    setSelectedItemId(newIds.length > 0 ? newIds[newIds.length - 1] : null);
    setSelectedWallId(null);
    setTool('select');
  };

  const handleCopyItems = () => {
    const itemsToCopy: CanvasItem[] = [];
    if (selectedItemIds.length > 0) {
      currentLayout.items.forEach(item => {
        if (selectedItemIds.includes(item.id)) {
          itemsToCopy.push({ ...item });
        }
      });
    } else if (selectedItemId) {
      const item = currentLayout.items.find(i => i.id === selectedItemId);
      if (item) {
        itemsToCopy.push({ ...item });
      }
    }
    
    if (itemsToCopy.length > 0) {
      setClipboard(itemsToCopy);
    }
  };

  const handleCutItems = () => {
    const itemsToCut: CanvasItem[] = [];
    const idsToCut: string[] = [];
    
    if (selectedItemIds.length > 0) {
      currentLayout.items.forEach(item => {
        if (selectedItemIds.includes(item.id)) {
          itemsToCut.push({ ...item });
          idsToCut.push(item.id);
        }
      });
    } else if (selectedItemId) {
      const item = currentLayout.items.find(i => i.id === selectedItemId);
      if (item) {
        itemsToCut.push({ ...item });
        idsToCut.push(item.id);
      }
    }

    if (itemsToCut.length > 0) {
      setClipboard(itemsToCut);
      
      const updatedLayout: LayoutState = {
        ...currentLayout,
        items: currentLayout.items.filter(item => !idsToCut.includes(item.id))
      };
      updateCurrentLayout(updatedLayout);
      setSelectedItemId(null);
      setSelectedItemIds([]);
    }
  };

  const handlePasteItems = () => {
    if (clipboard.length === 0) return;
    
    const pastedItems: CanvasItem[] = clipboard.map(item => {
      const newId = 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      const isSameFloor = currentLayout.items.some(i => i.id === item.id);
      const offset = isSameFloor ? 30 : 0;
      
      const newItem: CanvasItem = {
        ...item,
        id: newId,
        x: item.x + offset,
        y: item.y + offset
      };
      if (newItem.groupId) {
        delete newItem.groupId;
      }
      return newItem;
    });

    const updatedLayout: LayoutState = {
      ...currentLayout,
      items: [...currentLayout.items, ...pastedItems]
    };
    updateCurrentLayout(updatedLayout);
    
    if (pastedItems.length === 1) {
      setSelectedItemId(pastedItems[0].id);
      setSelectedItemIds([pastedItems[0].id]);
    } else {
      setSelectedItemId(null);
      setSelectedItemIds(pastedItems.map(i => i.id));
    }
    setSelectedWallId(null);
    setTool('select');
  };

  const handleCreateCustomFurniture = () => {
    if (!newFurniture.name.trim()) return;

    const newPreset = {
      name: newFurniture.name,
      type: newFurniture.type,
      width: newFurniture.width,
      depth: newFurniture.depth,
      color: newFurniture.color,
      icon: newFurniture.icon,
      fontSize: newFurniture.fontSize
    };

    // 1. Create the new item to add to the canvas layout
    const newId = 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const newItem: CanvasItem = {
      id: newId,
      name: newPreset.name,
      type: newPreset.type as 'furniture' | 'door' | 'window' | 'text',
      x: 400,
      y: 300,
      width: newPreset.width,
      depth: newPreset.depth,
      rotation: 0,
      color: newPreset.color,
      icon: newPreset.icon,
      fontSize: ('fontSize' in newPreset ? newPreset.fontSize : 16) || 16
    };

    // 2. Compute updated floors layout containing the new item
    const updatedFloors = project.floors.map(floor => {
      if (floor.id === currentFloorId) {
        const layoutToUpdate = currentVersion === 'before' ? floor.before : floor.after;
        const updatedLayout = {
          ...layoutToUpdate,
          items: [...layoutToUpdate.items, newItem]
        };
        return {
          ...floor,
          before: currentVersion === 'before' ? updatedLayout : floor.before,
          after: currentVersion === 'after' ? updatedLayout : floor.after
        };
      }
      return floor;
    });

    // 3. Update project state (with customPresets if scope is project)
    if (customScope === 'project') {
      const updatedPresets = [...(project.customPresets || []), newPreset];
      const updatedProject = {
        ...project,
        customPresets: updatedPresets,
        floors: updatedFloors
      };
      setProject(updatedProject);
      setHistory(prev => {
        const next = prev.slice(0, historyIndex + 1);
        return [...next, updatedProject];
      });
      setHistoryIndex(prev => prev + 1);
      localStorage.setItem('floorplan_project_studio_v2', JSON.stringify(updatedProject));
    } else {
      const savePresetBackend = async () => {
        try {
          const res = await fetch('/api/presets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              name: newPreset.name,
              type: newPreset.type,
              width: newPreset.width,
              depth: newPreset.depth,
              color: newPreset.color,
              icon: newPreset.icon,
              font_size: newPreset.fontSize
            })
          });
          const json = await res.json();
          if (json.success && json.data?.id) {
            const savedPreset = { ...newPreset, id: json.data.id };
            setGlobalPresets(prev => {
              const updated = [savedPreset, ...prev];
              localStorage.setItem('floorplan_global_presets', JSON.stringify(updated));
              return updated;
            });
          } else {
            setGlobalPresets(prev => {
              const updated = [newPreset, ...prev];
              localStorage.setItem('floorplan_global_presets', JSON.stringify(updated));
              return updated;
            });
          }
        } catch (e) {
          console.error('Error saving preset to server:', e);
          setGlobalPresets(prev => {
            const updated = [newPreset, ...prev];
            localStorage.setItem('floorplan_global_presets', JSON.stringify(updated));
            return updated;
          });
        }
      };
      savePresetBackend();

      const updatedProject = {
        ...project,
        floors: updatedFloors
      };
      setProject(updatedProject);
      setHistory(prev => {
        const next = prev.slice(0, historyIndex + 1);
        return [...next, updatedProject];
      });
      setHistoryIndex(prev => prev + 1);
      localStorage.setItem('floorplan_project_studio_v2', JSON.stringify(updatedProject));
    }

    // 4. Update selection and view tools
    setSelectedItemIds([newId]);
    setSelectedItemId(newId);
    setSelectedWallId(null);
    setTool('select');
  };

  const handleDeleteCustomPreset = async (presetToDelete: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmActionModal({
      title: 'Excluir Modelo Personalizado',
      message: `Tem certeza que deseja excluir o modelo "${presetToDelete.name}"? Esta ação não pode ser desfeita.`,
      onConfirm: async () => {
        if (presetToDelete.isProjectPreset) {
          const updatedPresets = (project.customPresets || []).filter(p => 
            !(p.name === presetToDelete.name && 
              p.type === presetToDelete.type && 
              p.width === presetToDelete.width && 
              p.depth === presetToDelete.depth && 
              p.color === presetToDelete.color && 
              p.icon === presetToDelete.icon)
          );
          const updatedProject = { ...project, customPresets: updatedPresets };
          setProject(updatedProject);
          setHistory(prev => {
            const next = prev.slice(0, historyIndex + 1);
            return [...next, updatedProject];
          });
          setHistoryIndex(prev => prev + 1);
          localStorage.setItem('floorplan_project_studio_v2', JSON.stringify(updatedProject));
        } else if (presetToDelete.isGlobalPreset) {
          if (presetToDelete.id) {
            try {
              const res = await fetch(`/api/presets/${presetToDelete.id}`, {
                method: 'DELETE',
                credentials: 'include'
              });
              const json = await res.json();
              if (json.success) {
                setGlobalPresets(prev => {
                  const updated = prev.filter(p => p.id !== presetToDelete.id);
                  localStorage.setItem('floorplan_global_presets', JSON.stringify(updated));
                  return updated;
                });
              } else {
                alert('Erro ao excluir modelo do servidor.');
              }
            } catch (err) {
              console.error('Error deleting preset:', err);
              setGlobalPresets(prev => {
                const updated = prev.filter(p => p.id !== presetToDelete.id);
                localStorage.setItem('floorplan_global_presets', JSON.stringify(updated));
                return updated;
              });
            }
          } else {
            setGlobalPresets(prev => {
              const updated = prev.filter(p => 
                !(p.name === presetToDelete.name && 
                  p.type === presetToDelete.type && 
                  p.width === presetToDelete.width && 
                  p.depth === presetToDelete.depth && 
                  p.color === presetToDelete.color && 
                  p.icon === presetToDelete.icon)
              );
              localStorage.setItem('floorplan_global_presets', JSON.stringify(updated));
              return updated;
            });
          }
        }
      }
    });
  };

  const handleOpenSaveCustomPresetModal = (item: CanvasItem) => {
    setSavePresetItem(item);
    setSavePresetName(item.name);
    setSavePresetScope('project');
    setIsSavePresetModalOpen(true);
  };

  const handleConfirmSaveCustomPreset = async () => {
    if (!savePresetItem || !savePresetName.trim()) return;

    const presetToSave = {
      name: savePresetName.trim(),
      type: savePresetItem.type,
      width: savePresetItem.width,
      depth: savePresetItem.depth,
      color: savePresetItem.color,
      icon: savePresetItem.icon,
      fontSize: savePresetItem.fontSize || 16
    };

    if (savePresetScope === 'project') {
      const updatedPresets = [...(project.customPresets || []), presetToSave];
      const updatedProject = { ...project, customPresets: updatedPresets };
      setProject(updatedProject);
      setHistory(prev => {
        const next = prev.slice(0, historyIndex + 1);
        return [...next, updatedProject];
      });
      setHistoryIndex(prev => prev + 1);
      localStorage.setItem('floorplan_project_studio_v2', JSON.stringify(updatedProject));
    } else {
      try {
        const res = await fetch('/api/presets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: presetToSave.name,
            type: presetToSave.type,
            width: presetToSave.width,
            depth: presetToSave.depth,
            color: presetToSave.color,
            icon: presetToSave.icon,
            font_size: presetToSave.fontSize
          })
        });
        const json = await res.json();
        if (json.success && json.data?.id) {
          const savedWithId = { ...presetToSave, id: json.data.id };
          setGlobalPresets(prev => {
            const updated = [savedWithId, ...prev];
            localStorage.setItem('floorplan_global_presets', JSON.stringify(updated));
            return updated;
          });
        } else {
          setGlobalPresets(prev => {
            const updated = [presetToSave, ...prev];
            localStorage.setItem('floorplan_global_presets', JSON.stringify(updated));
            return updated;
          });
        }
      } catch (e) {
        console.error('Error saving global preset:', e);
        setGlobalPresets(prev => {
          const updated = [presetToSave, ...prev];
          localStorage.setItem('floorplan_global_presets', JSON.stringify(updated));
          return updated;
        });
      }
    }

    setIsSavePresetModalOpen(false);
    setSavePresetItem(null);
  };

  const handleSaveProjectManual = async () => {
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: projectId, name: project.name, data: JSON.stringify(project) })
      });
      if (!res.ok) throw new Error('Save failed');
      setSaveStatus('saved');
    } catch (e) {
      console.error('Failed to save to server:', e);
      setSaveStatus('idle');
      alert('Erro ao salvar. Verifique a conexão com o servidor.');
    }
    setTimeout(() => setSaveStatus('idle'), 1500);
  };

  const handleSaveAs = async (newName: string) => {
    const newId = 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const newProject = { ...project, name: newName };
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: newId, name: newName, data: JSON.stringify(newProject) })
      });
      if (!res.ok) throw new Error('Save failed');
      // Switch active project to the new one
      setProjectId(newId);
      setProject(newProject);
      setSaveStatus('saved');
    } catch (e) {
      console.error('Failed to save as:', e);
      setSaveStatus('idle');
      alert('Erro ao salvar. Verifique a conexão com o servidor.');
    }
    setTimeout(() => setSaveStatus('idle'), 1500);
    setIsSaveAsModalOpen(false);
  };

  const handleNewProject = () => {
    setConfirmActionModal({
      title: 'Novo Projeto',
      message: 'Criar um novo projeto em branco? As alterações não salvas serão perdidas.',
      onConfirm: () => {
        const blank = makeBlankProject();
        const newId = 'proj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        setProjectId(newId);
        setProject(blank);
        setHistory([blank]);
        setHistoryIndex(0);
        setSelectedItemId(null);
        setSelectedWallId(null);
        setCurrentFloorId('floor_1');
        setCurrentVersion('after');
      }
    });
  };

  const handleOpenProjects = async () => {
    setProjectsLoading(true);
    setIsProjectsModalOpen(true);
    try {
      const res = await fetch('/api/projects', { credentials: 'include' });
      const json = await res.json();
      if (json.success) setSavedProjects(json.data);
    } catch (e) {
      console.error(e);
    }
    setProjectsLoading(false);
  };

  const handleLoadProject = async (pid: string) => {
    try {
      const res = await fetch(`/api/projects/${pid}`, { credentials: 'include' });
      const json = await res.json();
      if (!json.success) { alert('Erro ao abrir projeto.'); return; }
      const loaded: Project = JSON.parse(json.data.data);
      // Migration
      if (loaded && !loaded.floors) {
        const migrated: Project = {
          name: loaded.name || 'Projeto',
          customPresets: [],
          floors: [{ id: 'floor_1', name: 'Pavimento Térreo', before: (loaded as any).before || {walls:[],items:[]}, after: (loaded as any).after || {walls:[],items:[]} }]
        };
        setProject(migrated);
        setHistory([migrated]);
      } else {
        setProject(loaded);
        setHistory([loaded]);
      }
      setProjectId(pid);
      setHistoryIndex(0);
      setSelectedItemId(null);
      setSelectedWallId(null);
      setCurrentFloorId('floor_1');
      setCurrentVersion('after');
      setIsProjectsModalOpen(false);
    } catch (e) {
      alert('Erro ao carregar projeto.');
    }
  };

  const handleDeleteSavedProject = async (pid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmActionModal({
      title: 'Excluir Projeto',
      message: 'Tem certeza que deseja excluir este projeto permanentemente? Esta ação não pode ser desfeita.',
      onConfirm: async () => {
        await fetch(`/api/projects/${pid}`, { method: 'DELETE', credentials: 'include' });
        setSavedProjects(prev => prev.filter(p => p.id !== pid));
      }
    });
  };

  // --- CRUD FUNCTIONS ---
  const handleAddItem = (preset: any) => {
    const viewportWidth = 600;
    const viewportHeight = 400;
    const centerCoords = {
      x: snapValue((-pan.x + viewportWidth / 2) / zoom),
      y: snapValue((-pan.y + viewportHeight / 2) / zoom)
    };

    const newItem: CanvasItem = {
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: preset.name,
      type: preset.type as 'furniture' | 'door' | 'window' | 'text',
      x: centerCoords.x,
      y: centerCoords.y,
      width: preset.width,
      depth: preset.depth,
      rotation: 0,
      color: preset.color,
      icon: preset.icon,
      fontSize: ('fontSize' in preset ? preset.fontSize : 16) || 16
    };

    const updatedLayout: LayoutState = {
      ...currentLayout,
      items: [...currentLayout.items, newItem]
    };
    updateCurrentLayout(updatedLayout);
    setSelectedItemId(newItem.id);
    setSelectedWallId(null);
    setTool('select');
  };

  const handleAddTextAnnotation = () => {
    handleAddItem({
      name: 'Nome do Cômodo',
      type: 'text',
      width: 120,
      depth: 40,
      color: '#cbd5e1',
      icon: 'text',
      fontSize: 16
    });
  };

  const handleUpdateItem = (itemId: string, updates: Partial<CanvasItem>, saveToHistory: boolean = true) => {
    const updatedItems = currentLayout.items.map(item => {
      if (item.id === itemId) {
        return { ...item, ...updates };
      }
      return item;
    });

    updateCurrentLayout({
      ...currentLayout,
      items: updatedItems
    }, saveToHistory);
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = currentLayout.items.filter(item => item.id !== itemId);
    updateCurrentLayout({
      ...currentLayout,
      items: updatedItems
    }, true);
    setSelectedItemId(null);
  };

  const handleDeleteMultipleItems = (itemIds: string[]) => {
    const updatedItems = currentLayout.items.filter(item => !itemIds.includes(item.id));
    updateCurrentLayout({
      ...currentLayout,
      items: updatedItems
    }, true);
    setSelectedItemId(null);
    setSelectedItemIds([]);
  };

  const handleUpdateWall = (wallId: string, updates: Partial<Wall>, saveToHistory: boolean = true) => {
    const updatedWalls = currentLayout.walls.map(wall => {
      if (wall.id === wallId) {
        return { ...wall, ...updates };
      }
      return wall;
    });

    updateCurrentLayout({
      ...currentLayout,
      walls: updatedWalls
    }, saveToHistory);
  };

  const handleDeleteWall = (wallId: string) => {
    const updatedWalls = currentLayout.walls.filter(wall => wall.id !== wallId);
    updateCurrentLayout({
      ...currentLayout,
      walls: updatedWalls
    }, true);
    setSelectedWallId(null);
  };

  const handleDeleteMultipleWalls = (wallIds: string[]) => {
    const updatedWalls = currentLayout.walls.filter(wall => !wallIds.includes(wall.id));
    updateCurrentLayout({
      ...currentLayout,
      walls: updatedWalls
    }, true);
    setSelectedWallId(null);
    setSelectedWallIds([]);
  };

  const handleClearAll = () => {
    setConfirmActionModal({
      title: "Limpar Pavimento",
      message: "Tem certeza de que deseja limpar completamente esta versão do layout neste pavimento? Todos os itens e paredes desta versão serão excluídos.",
      onConfirm: () => {
        updateCurrentLayout({ walls: [], items: [] });
        setSelectedItemId(null);
        setSelectedItemIds([]);
        setSelectedWallId(null);
        setDrawingWallStart(null);
      }
    });
  };

  // --- EXPORT / IMPORT ---
  const handleExportProject = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${project.name.toLowerCase().replace(/\s+/g, '_')}_projeto.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files.length > 0) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && (parsed.floors || parsed.before)) {
            // Run migration if importing older format
            if (parsed && !parsed.floors) {
              const migrated: Project = {
                name: parsed.name || 'Projeto Importado',
                floors: [
                  {
                    id: 'floor_1',
                    name: 'Pavimento Térreo',
                    before: parsed.before || { walls: [], items: [] },
                    after: parsed.after || { walls: [], items: [] }
                  }
                ]
              };
              commitProjectChange(migrated);
            } else {
              commitProjectChange(parsed);
            }
            alert('Projeto carregado com sucesso!');
          } else {
            alert('Formato de arquivo incompatível.');
          }
        } catch (err) {
          alert('Erro de leitura do arquivo JSON.');
        }
      };
    }
  };

  // --- MOUSE & PAN/DRAG EVENTS ---
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>, targetSvg: SVGSVGElement | null) => {
    const coords = getCanvasCoords(e.clientX, e.clientY, targetSvg);
    const snapped = {
      x: snapValue(coords.x),
      y: snapValue(coords.y)
    };

    const isBackground = e.target === targetSvg || (e.target as SVGElement).id === 'grid-background';
    
    // Pan tool OR middle mouse button OR select+alt
    if (e.button === 1 || tool === 'pan' || (tool === 'select' && isBackground && e.altKey)) {
      if (e.button === 1 || tool === 'pan' || e.altKey) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        e.preventDefault();
        return;
      }
    }

    if (tool === 'wall') {
      if (!drawingWallStart) {
        setDrawingWallStart(snapped);
      } else {
        let endX = snapped.x;
        let endY = snapped.y;

        if (e.shiftKey) {
          const dx = endX - drawingWallStart.x;
          const dy = endY - drawingWallStart.y;
          if (Math.abs(dx) > Math.abs(dy)) {
            endY = drawingWallStart.y;
          } else {
            endX = drawingWallStart.x;
          }
        }

        if (drawingWallStart.x !== endX || drawingWallStart.y !== endY) {
          const newWall: Wall = {
            id: 'wall_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            x1: drawingWallStart.x,
            y1: drawingWallStart.y,
            x2: endX,
            y2: endY,
            thickness: 15,
            curve: 0
          };

          updateCurrentLayout({
            ...currentLayout,
            walls: [...currentLayout.walls, newWall]
          });
          setDrawingWallStart({ x: endX, y: endY });
        }
      }
      return;
    }

    if (tool === 'select') {
      if (isBackground) {
        const isMulti = e.shiftKey || e.metaKey || e.ctrlKey;
        if (!isMulti) {
          setSelectedItemId(null);
          setSelectedItemIds([]);
          setSelectedWallId(null);
        }
        setIsSelectingBox(true);
        setSelectionBoxStart(coords);
        setSelectionBoxEnd(coords);
        return;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>, targetSvg: SVGSVGElement | null) => {
    const coords = getCanvasCoords(e.clientX, e.clientY, targetSvg);
    setMousePos(coords);

    if (isSelectingBox && selectionBoxStart) {
      setSelectionBoxEnd(coords);
      
      const minX = Math.min(selectionBoxStart.x, coords.x);
      const maxX = Math.max(selectionBoxStart.x, coords.x);
      const minY = Math.min(selectionBoxStart.y, coords.y);
      const maxY = Math.max(selectionBoxStart.y, coords.y);
      
      const foundIds: string[] = [];
      currentLayout.items.forEach(item => {
        if (item.x >= minX && item.x <= maxX && item.y >= minY && item.y <= maxY) {
          foundIds.push(item.id);
        }
      });
      
      const foundWallIds: string[] = [];
      currentLayout.walls.forEach(wall => {
        const midX = (wall.x1 + wall.x2) / 2;
        const midY = (wall.y1 + wall.y2) / 2;
        if (midX >= minX && midX <= maxX && midY >= minY && midY <= maxY) {
          foundWallIds.push(wall.id);
        }
      });
      
      const isMulti = e.shiftKey || e.metaKey || e.ctrlKey;
      let finalIds = foundIds;
      if (isMulti) {
        finalIds = Array.from(new Set([...selectedItemIds, ...foundIds]));
      }
      
      setSelectedItemIds(finalIds);
      if (finalIds.length > 0) {
        setSelectedItemId(finalIds[finalIds.length - 1]);
      } else {
        setSelectedItemId(null);
      }

      let finalWallIds = foundWallIds;
      if (isMulti) {
        finalWallIds = Array.from(new Set([...selectedWallIds, ...foundWallIds]));
      }

      setSelectedWallIds(finalWallIds);
      if (finalWallIds.length > 0) {
        setSelectedWallId(finalWallIds[finalWallIds.length - 1]);
      } else {
        setSelectedWallId(null);
      }
      return;
    }

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    // 1. Dragging Wall Curve control handle
    if (isDraggingWallCurve && draggedWallCurveId) {
      const wall = currentLayout.walls.find(w => w.id === draggedWallCurveId);
      if (wall) {
        const { cx, cy, nx, ny } = getWallBezierParams(wall);
        // Project vector from mid-chord (cx, cy) to mouse onto normal vector (nx, ny)
        const vx = coords.x - cx;
        const vy = coords.y - cy;
        const curveVal = vx * nx + vy * ny;
        
        // Snapping curve value
        const snappedCurve = snapValue(curveVal);
        
        // If curve value is close to 0, snap it to straight (0)
        const finalCurve = Math.abs(snappedCurve) < 4 ? 0 : snappedCurve;

        handleUpdateWall(draggedWallCurveId, { curve: finalCurve }, false);
      }
      return;
    }

    // 2. Dragging Entire Wall
    if (isDraggingWall && draggedWallId) {
      let nextX1 = coords.x - wallDragStartOffset.x1;
      let nextY1 = coords.y - wallDragStartOffset.y1;
      let nextX2 = coords.x - wallDragStartOffset.x2;
      let nextY2 = coords.y - wallDragStartOffset.y2;

      nextX1 = snapValue(nextX1);
      nextY1 = snapValue(nextY1);
      nextX2 = snapValue(nextX2);
      nextY2 = snapValue(nextY2);

      const startPos = draggedWallsStartPos[draggedWallId];
      if (startPos && selectedWallIds.length > 1) {
        const dx = nextX1 - startPos.x1;
        const dy = nextY1 - startPos.y1;
        
        const updatesMap: { [wallId: string]: Partial<Wall> } = {};
        selectedWallIds.forEach(id => {
          const wallStartPos = draggedWallsStartPos[id];
          if (wallStartPos) {
            updatesMap[id] = {
              x1: snapValue(wallStartPos.x1 + dx),
              y1: snapValue(wallStartPos.y1 + dy),
              x2: snapValue(wallStartPos.x2 + dx),
              y2: snapValue(wallStartPos.y2 + dy)
            };
          }
        });
        handleUpdateMultipleWalls(updatesMap, false);
      } else {
        handleUpdateWall(draggedWallId, { x1: nextX1, y1: nextY1, x2: nextX2, y2: nextY2 }, false);
      }
      return;
    }

    // 3. Dragging Wall Node Endpoint handle
    if (draggingWallNode && draggingWallNode.wallId) {
      let endX = snapValue(coords.x);
      let endY = snapValue(coords.y);

      const wallObj = currentLayout.walls.find(w => w.id === draggingWallNode.wallId);
      if (wallObj && e.shiftKey) {
        const otherX = draggingWallNode.nodeIndex === 1 ? wallObj.x2 : wallObj.x1;
        const otherY = draggingWallNode.nodeIndex === 1 ? wallObj.y2 : wallObj.y1;
        const dx = endX - otherX;
        const dy = endY - otherY;
        if (Math.abs(dx) > Math.abs(dy)) {
          endY = otherY;
        } else {
          endX = otherX;
        }
      }

      if (draggingWallNode.nodeIndex === 1) {
        handleUpdateWall(draggingWallNode.wallId, { x1: endX, y1: endY }, false);
      } else {
        handleUpdateWall(draggingWallNode.wallId, { x2: endX, y2: endY }, false);
      }
      return;
    }

    // 4. Dragging Furniture/Text Canvas Item
    if (isDraggingItem && draggedItemId) {
      let nextX = coords.x - dragStartOffset.x;
      let nextY = coords.y - dragStartOffset.y;

      nextX = snapValue(nextX);
      nextY = snapValue(nextY);

      const startPos = draggedItemsStartPos[draggedItemId];
      if (startPos && selectedItemIds.length > 1) {
        const dx = nextX - startPos.x;
        const dy = nextY - startPos.y;
        
        const updatesMap: { [itemId: string]: Partial<CanvasItem> } = {};
        selectedItemIds.forEach(id => {
          const itemStartPos = draggedItemsStartPos[id];
          if (itemStartPos) {
            updatesMap[id] = {
              x: snapValue(itemStartPos.x + dx),
              y: snapValue(itemStartPos.y + dy)
            };
          }
        });
        handleUpdateMultipleItems(updatesMap, false);
      } else {
        handleUpdateItem(draggedItemId, { x: nextX, y: nextY }, false);
      }
      return;
    }

    // 5. Rotating Item
    if (isRotating && rotatingItemId) {
      const item = currentLayout.items.find(i => i.id === rotatingItemId);
      if (item) {
        const dx = coords.x - item.x;
        const dy = coords.y - item.y;
        let angleRad = Math.atan2(dx, -dy);
        let angleDeg = angleRad * (180 / Math.PI);
        if (angleDeg < 0) angleDeg += 360;

        if (e.shiftKey) {
          angleDeg = Math.round(angleDeg / 15) * 15;
        }

        handleUpdateItem(rotatingItemId, { rotation: Math.round(angleDeg) }, false);
      }
      return;
    }
  };

  const handleMouseUp = () => {
    const wasActiveDragAction = isDraggingItem || isRotating || isDraggingWall || draggingWallNode || isDraggingWallCurve;

    setIsPanning(false);
    setIsDraggingItem(false);
    setDraggedItemId(null);
    setIsRotating(false);
    setRotatingItemId(null);
    setIsDraggingWall(false);
    setDraggedWallId(null);
    setDraggingWallNode(null);
    setIsDraggingWallCurve(false);
    setDraggedWallCurveId(null);
    if (isSelectingBox) {
      setIsSelectingBox(false);
      setSelectionBoxStart(null);
      setSelectionBoxEnd(null);
    }

    if (wasActiveDragAction) {
      commitProjectChange(project, true);
    }
  };

  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    if (direction === 'in') {
      setZoom(prev => Math.min(prev + 0.1, 3.0));
    } else if (direction === 'out') {
      setZoom(prev => Math.max(prev - 0.1, 0.2));
    } else {
      setZoom(0.8);
      setPan({ x: 150, y: 100 });
    }
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const zoomFactor = 0.05;
    if (e.deltaY < 0) {
      setZoom(prev => Math.min(prev + zoomFactor, 3.0));
    } else {
      setZoom(prev => Math.max(prev - zoomFactor, 0.2));
    }
  };

  // Rotation gizmo line calculations
  const getItemHingeOffset = (item: CanvasItem) => {
    const rad = (item.rotation * Math.PI) / 180;
    const distance = item.depth / 2 + 30;
    return {
      x: item.x + distance * Math.sin(rad),
      y: item.y - distance * Math.cos(rad)
    };
  };

  // --- CUSTOM SVG FURNITURE RENDERERS ---
  const renderFurnitureGraphic = (item: CanvasItem) => {
    const w = item.width;
    const d = item.depth;
    const isLight = theme === 'light';
    const strokePrimary = isLight ? '#334155' : '#f8fafc';
    const strokeSecondary = isLight ? '#64748b' : '#cbd5e1';
    const strokeWhite = isLight ? '#334155' : '#ffffff';

    switch (item.icon) {
      case 'stairs':
        return (
          <>
            <rect x={-w/2} y={-d/2} width={w} height={d} rx={2} fill="none" stroke={strokePrimary} strokeWidth={2} />
            {Array.from({ length: 8 }).map((_, i) => {
              const stepY = -d/2 + (d / 9) * (i + 1);
              return <line key={i} x1={-w/2} y1={stepY} x2={w/2} y2={stepY} stroke={strokeSecondary} strokeWidth={1} />;
            })}
            <path d={`M 0 ${d/2 - 15} L 0 ${-d/2 + 15} M -6 ${-d/2 + 25} L 0 ${-d/2 + 15} L 6 ${-d/2 + 25}`} fill="none" stroke="#6366f1" strokeWidth={2} />
          </>
        );
      case 'sink':
        return (
          <>
            <rect x={-w/2} y={-d/2} width={w} height={d} rx={4} fill="none" stroke={strokePrimary} strokeWidth={2} />
            <rect x={-w/2 + 10} y={-d/2 + 10} width={w - 20} height={d - 20} rx={4} fill="none" stroke="#94a3b8" strokeWidth={1.5} />
            <circle cx={0} cy={0} r={4} fill="none" stroke="#94a3b8" strokeWidth={1.5} />
            <line x1={0} y1={-d/2 + 2} x2={0} y2={-d/2 + 10} stroke={strokeSecondary} strokeWidth={2} />
          </>
        );
      case 'stove':
        return (
          <>
            <rect x={-w/2} y={-d/2} width={w} height={d} rx={4} fill="none" stroke={strokePrimary} strokeWidth={2} />
            <circle cx={-w/4} cy={-d/4} r={w/10} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
            <circle cx={w/4} cy={-d/4} r={w/12} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
            <circle cx={-w/4} cy={d/4} r={w/12} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
            <circle cx={w/4} cy={d/4} r={w/10} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
            <line x1={-w/2 + 8} y1={d/2 - 4} x2={w/2 - 8} y2={d/2 - 4} stroke={strokeSecondary} strokeWidth={2.5} />
          </>
        );
      case 'refrigerator':
        return (
          <>
            <rect x={-w/2} y={-d/2} width={w} height={d} rx={4} fill="none" stroke={strokePrimary} strokeWidth={2} />
            <line x1={-w/2} y1={-d/2 + d*0.3} x2={w/2} y2={-d/2 + d*0.3} stroke={strokeSecondary} strokeWidth={1.5} />
            <line x1={-w/2 + 4} y1={-d/2 + 8} x2={-w/2 + 4} y2={d/2 - 8} stroke={strokeWhite} strokeWidth={3} />
          </>
        );
      case 'sofa':
        return (
          <>
            <rect x={-w/2} y={-d/2} width={w} height={d} rx={8} fill="none" stroke={strokePrimary} strokeWidth={2} />
            <rect x={-w/2} y={-d/2} width={14} height={d} rx={3} fill="none" stroke={strokeSecondary} strokeWidth={1} />
            <rect x={w/2 - 14} y={-d/2} width={14} height={d} rx={3} fill="none" stroke={strokeSecondary} strokeWidth={1} />
            <rect x={-w/2 + 14} y={-d/2} width={w - 28} height={16} rx={3} fill="none" stroke={strokeSecondary} strokeWidth={1} />
            {w > 120 && <line x1={0} y1={-d/2 + 16} x2={0} y2={d/2} stroke="#64748b" strokeWidth={1} />}
          </>
        );
      case 'table':
        return (
          <>
            <rect x={-w/2} y={-d/2} width={w} height={d} rx={4} fill="none" stroke={strokePrimary} strokeWidth={2} />
            <rect x={-w/2 + 8} y={-d/2 + 8} width={w - 16} height={d - 16} rx={2} fill="none" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3,3" />
          </>
        );
      case 'chair':
        return (
          <>
            <rect x={-w/2} y={-d/2} width={w} height={d} rx={8} fill="none" stroke={strokePrimary} strokeWidth={2} />
            <path d={`M ${-w/2 + 6} ${-d/2 + 8} Q 0 ${-d/2 + 16} ${w/2 - 6} ${-d/2 + 8}`} fill="none" stroke={strokeSecondary} strokeWidth={2} />
          </>
        );
      case 'bed':
        return (
          <>
            <rect x={-w/2} y={-d/2} width={w} height={d} rx={6} fill="none" stroke={strokePrimary} strokeWidth={2} />
            <rect x={-w/2 + 12} y={-d/2 + 12} width={w/2 - 18} height={d*0.16} rx={3} fill="none" stroke="#94a3b8" strokeWidth={1.5} />
            <rect x={6} y={-d/2 + 12} width={w/2 - 18} height={d*0.16} rx={3} fill="none" stroke="#94a3b8" strokeWidth={1.5} />
            <line x1={-w/2} y1={-d/2 + d*0.28} x2={w/2} y2={-d/2 + d*0.28} stroke={strokeSecondary} strokeWidth={1.5} />
            <line x1={-w/2} y1={-d/2 + d*0.36} x2={w/2} y2={-d/2 + d*0.36} stroke="#64748b" strokeWidth={1} strokeDasharray="3,3" />
          </>
        );
      case 'toilet':
        return (
          <>
            <rect x={-w/2} y={-d/2} width={w} height={d*0.28} rx={2} fill="none" stroke={strokeSecondary} strokeWidth={1.5} />
            <ellipse cx={0} cy={d*0.18} rx={w*0.42} ry={d*0.3} fill="none" stroke={strokePrimary} strokeWidth={2} />
            <ellipse cx={0} cy={d*0.18} rx={w*0.3} ry={d*0.2} fill="none" stroke="#64748b" strokeWidth={1} />
          </>
        );
      case 'plant':
        return (
          <>
            <circle cx={0} cy={0} r={w/3} fill="none" stroke="#10b981" strokeWidth={2} />
            <path d="M 0,0 C -6,-18 -22,-24 -32,-18" stroke="#10b981" strokeWidth={1.5} fill="none" />
            <path d="M 0,0 C 6,-18 22,-24 32,-18" stroke="#10b981" strokeWidth={1.5} fill="none" />
            <path d="M 0,0 C -18,6 -24,22 -18,32" stroke="#10b981" strokeWidth={1.5} fill="none" />
            <path d="M 0,0 C 18,6 24,22 18,32" stroke="#10b981" strokeWidth={1.5} fill="none" />
            <path d="M 0,0 C -12,-12 -28,0 -24,18" stroke="#10b981" strokeWidth={1.5} fill="none" />
            <path d="M 0,0 C 12,-12 28,0 24,18" stroke="#10b981" strokeWidth={1.5} fill="none" />
          </>
        );
      case 'tv':
        return (
          <>
            <rect x={-w/2} y={-d/2} width={w} height={d} rx={2} fill="none" stroke={strokePrimary} strokeWidth={2} />
            <rect x={-w*0.38} y={-3} width={w*0.76} height={6} rx={1} fill="rgba(11, 15, 25, 0.9)" stroke={strokePrimary} strokeWidth={1} />
          </>
        );
      case 'door':
        return (
          <>
            <path d={`M ${-w/2} ${-w} A ${w} ${w} 0 0 1 ${w/2} 0`} fill="none" stroke={strokePrimary} strokeWidth={1.5} strokeDasharray="3,3" />
            <line x1={-w/2} y1={0} x2={-w/2} y2={-w} stroke="#6366f1" strokeWidth={3} />
            <line x1={-w/2} y1={0} x2={w/2} y2={0} stroke="#94a3b8" strokeWidth={1.5} />
            <circle cx={-w/2} cy={0} r={4} fill="#6366f1" />
          </>
        );
      case 'window':
        return (
          <>
            <rect x={-w/2} y={-d/2} width={w} height={d} fill="none" stroke="#38bdf8" strokeWidth={2} />
            <line x1={-w/2} y1={0} x2={w/2} y2={0} stroke="#38bdf8" strokeWidth={1.5} />
            <line x1={-w/2} y1={-3} x2={w/2} y2={-3} stroke="#38bdf8" strokeWidth={1} />
            <line x1={-w/2} y1={3} x2={w/2} y2={3} stroke="#38bdf8" strokeWidth={1} />
          </>
        );
      case 'door_slide':
        return (
          <>
            <line x1={-w/2} y1={0} x2={w/2} y2={0} stroke="#94a3b8" strokeWidth={1.5} />
            <rect x={-w/2} y={-3} width={w*0.48} height={6} rx={1} fill="none" stroke={strokePrimary} strokeWidth={1.5} />
            <rect x={2} y={-3} width={w*0.48} height={6} rx={1} fill="none" stroke={strokePrimary} strokeWidth={1.5} />
            <path d={`M ${-w/4} -6 L ${-w/4 - 10} -6 M ${w/4} 6 L ${w/4 + 10} 6`} stroke="#6366f1" strokeWidth={1} />
          </>
        );
      case 'stairs_spiral':
        return (
          <>
            <circle cx={0} cy={0} r={w/2} fill="none" stroke={strokePrimary} strokeWidth={2} />
            <circle cx={0} cy={0} r={8} fill={strokeWhite} />
            {Array.from({ length: 12 }).map((_, i) => {
              const angleRad = (i * 30 * Math.PI) / 180;
              const x2 = (w/2) * Math.cos(angleRad);
              const y2 = (w/2) * Math.sin(angleRad);
              return <line key={i} x1={0} y1={0} x2={x2} y2={y2} stroke={strokeSecondary} strokeWidth={1} />;
            })}
            <path d={`M 0 0 A ${w/3} ${w/3} 0 0 1 ${w*0.25} ${w*0.25}`} fill="none" stroke="#6366f1" strokeWidth={1.5} />
          </>
        );
      case 'stairs_l':
        return (
          <>
            <rect x={-w/2} y={-d/2} width={w} height={d} rx={2} fill="none" stroke={strokePrimary} strokeWidth={2} />
            {Array.from({ length: 6 }).map((_, i) => {
              const stepY = -d/2 + (d * 0.5 / 6) * i;
              return <line key={i} x1={-w/2} y1={stepY} x2={-w/2 + w*0.5} y2={stepY} stroke={strokeSecondary} strokeWidth={1} />;
            })}
            {Array.from({ length: 6 }).map((_, i) => {
              const stepX = -w/2 + w*0.5 + (w * 0.5 / 6) * i;
              return <line key={i} x1={stepX} y1={d/2 - d*0.5} x2={stepX} y2={d/2} stroke={strokeSecondary} strokeWidth={1} />;
            })}
            <rect x={-w/2} y={0} width={w*0.5} height={d*0.5} fill="none" stroke={strokeSecondary} strokeWidth={1} />
            <path d={`M ${-w/4} ${-d/3} L ${-w/4} ${d/4} L ${w/3} ${d/4}`} fill="none" stroke="#6366f1" strokeWidth={2} />
          </>
        );
      case 'sink_bath':
        return (
          <>
            <rect x={-w/2} y={-d/2} width={w} height={d} rx={d/2} fill="none" stroke={strokePrimary} strokeWidth={2} />
            <ellipse cx={0} cy={0} rx={w*0.3} ry={d*0.25} fill="none" stroke={strokeSecondary} strokeWidth={1.5} />
            <circle cx={0} cy={-d*0.25} r={3} fill={strokeSecondary} />
            <line x1={0} y1={-d/2} x2={0} y2={-d*0.25} stroke={strokeWhite} strokeWidth={2} />
          </>
        );
      case 'shower':
        return (
          <>
            <rect x={-w/2} y={-d/2} width={w} height={d} fill="none" stroke={strokePrimary} strokeWidth={2} />
            <line x1={-w/2} y1={-d/2} x2={w/2} y2={d/2} stroke={strokeSecondary} strokeWidth={1} strokeDasharray="3,3" />
            <line x1={-w/2} y1={d/2} x2={w/2} y2={-d/2} stroke={strokeSecondary} strokeWidth={1} strokeDasharray="3,3" />
            <circle cx={0} cy={0} r={10} fill="none" stroke="#6366f1" strokeWidth={1.5} />
            <circle cx={0} cy={0} r={2} fill="#6366f1" />
          </>
        );
      default:
        return null;
    }
  };

  const renderPrintSvg = (layout: LayoutState) => {
    let minX = 0, minY = 0, maxX = 800, maxY = 600;
    if (layout.walls.length > 0 || layout.items.length > 0) {
      const xs: number[] = [];
      const ys: number[] = [];
      layout.walls.forEach(w => {
        xs.push(w.x1, w.x2);
        ys.push(w.y1, w.y2);
      });
      layout.items.forEach(item => {
        xs.push(item.x - item.width/2, item.x + item.width/2);
        ys.push(item.y - item.depth/2, item.y + item.depth/2);
      });
      minX = Math.min(...xs) - 80;
      minY = Math.min(...ys) - 80;
      maxX = Math.max(...xs) + 80;
      maxY = Math.max(...ys) + 80;
    }
    const width = maxX - minX;
    const height = maxY - minY;

    const strokePrimary = '#334155';
    const strokeSecondary = '#64748b';
    const strokeWhite = '#334155';

    const renderPrintFurnitureGraphic = (item: CanvasItem) => {
      const w = item.width;
      const d = item.depth;
      switch (item.icon) {
        case 'stairs':
          return (
            <>
              <rect x={-w/2} y={-d/2} width={w} height={d} rx={2} fill="none" stroke={strokePrimary} strokeWidth={2} />
              {Array.from({ length: 8 }).map((_, i) => {
                const stepY = -d/2 + (d / 9) * (i + 1);
                return <line key={i} x1={-w/2} y1={stepY} x2={w/2} y2={stepY} stroke={strokeSecondary} strokeWidth={1} />;
              })}
              <path d={`M 0 ${d/2 - 15} L 0 ${-d/2 + 15} M -6 ${-d/2 + 25} L 0 ${-d/2 + 15} L 6 ${-d/2 + 25}`} fill="none" stroke="#6366f1" strokeWidth={2} />
            </>
          );
        case 'sink':
          return (
            <>
              <rect x={-w/2} y={-d/2} width={w} height={d} rx={4} fill="none" stroke={strokePrimary} strokeWidth={2} />
              <rect x={-w/2 + 10} y={-d/2 + 10} width={w - 20} height={d - 20} rx={4} fill="none" stroke="#94a3b8" strokeWidth={1.5} />
              <circle cx={0} cy={0} r={4} fill="none" stroke="#94a3b8" strokeWidth={1.5} />
              <line x1={0} y1={-d/2 + 2} x2={0} y2={-d/2 + 10} stroke={strokeSecondary} strokeWidth={2} />
            </>
          );
        case 'stove':
          return (
            <>
              <rect x={-w/2} y={-d/2} width={w} height={d} rx={4} fill="none" stroke={strokePrimary} strokeWidth={2} />
              <circle cx={-w/4} cy={-d/4} r={w/10} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
              <circle cx={w/4} cy={-d/4} r={w/12} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
              <circle cx={-w/4} cy={d/4} r={w/12} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
              <circle cx={w/4} cy={d/4} r={w/10} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
              <line x1={-w/2 + 8} y1={d/2 - 4} x2={w/2 - 8} y2={d/2 - 4} stroke={strokeSecondary} strokeWidth={2.5} />
            </>
          );
        case 'refrigerator':
          return (
            <>
              <rect x={-w/2} y={-d/2} width={w} height={d} rx={4} fill="none" stroke={strokePrimary} strokeWidth={2} />
              <line x1={-w/2} y1={-d/2 + d*0.3} x2={w/2} y2={-d/2 + d*0.3} stroke={strokeSecondary} strokeWidth={1.5} />
              <line x1={-w/2 + 4} y1={-d/2 + 8} x2={-w/2 + 4} y2={d/2 - 8} stroke={strokeWhite} strokeWidth={3} />
            </>
          );
        case 'sofa':
          return (
            <>
              <rect x={-w/2} y={-d/2} width={w} height={d} rx={8} fill="none" stroke={strokePrimary} strokeWidth={2} />
              <rect x={-w/2} y={-d/2} width={14} height={d} rx={3} fill="none" stroke={strokeSecondary} strokeWidth={1} />
              <rect x={w/2 - 14} y={-d/2} width={14} height={d} rx={3} fill="none" stroke={strokeSecondary} strokeWidth={1} />
              <rect x={-w/2 + 14} y={-d/2} width={w - 28} height={16} rx={3} fill="none" stroke={strokeSecondary} strokeWidth={1} />
              {w > 120 && <line x1={0} y1={-d/2 + 16} x2={0} y2={d/2} stroke="#64748b" strokeWidth={1} />}
            </>
          );
        case 'table':
          return (
            <>
              <rect x={-w/2} y={-d/2} width={w} height={d} rx={4} fill="none" stroke={strokePrimary} strokeWidth={2} />
              <rect x={-w/2 + 8} y={-d/2 + 8} width={w - 16} height={d - 16} rx={2} fill="none" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3,3" />
            </>
          );
        case 'chair':
          return (
            <>
              <rect x={-w/2} y={-d/2} width={w} height={d} rx={8} fill="none" stroke={strokePrimary} strokeWidth={2} />
              <path d={`M ${-w/2 + 6} ${-d/2 + 8} Q 0 ${-d/2 + 16} ${w/2 - 6} ${-d/2 + 8}`} fill="none" stroke={strokeSecondary} strokeWidth={2} />
            </>
          );
        case 'bed':
          return (
            <>
              <rect x={-w/2} y={-d/2} width={w} height={d} rx={6} fill="none" stroke={strokePrimary} strokeWidth={2} />
              <rect x={-w/2 + 12} y={-d/2 + 12} width={w/2 - 18} height={d*0.16} rx={3} fill="none" stroke="#94a3b8" strokeWidth={1.5} />
              <rect x={6} y={-d/2 + 12} width={w/2 - 18} height={d*0.16} rx={3} fill="none" stroke="#94a3b8" strokeWidth={1.5} />
              <line x1={-w/2} y1={-d/2 + d*0.28} x2={w/2} y2={-d/2 + d*0.28} stroke={strokeSecondary} strokeWidth={1.5} />
              <line x1={-w/2} y1={-d/2 + d*0.36} x2={w/2} y2={-d/2 + d*0.36} stroke="#64748b" strokeWidth={1} strokeDasharray="3,3" />
            </>
          );
        case 'toilet':
          return (
            <>
              <rect x={-w/2} y={-d/2} width={w} height={d*0.28} rx={2} fill="none" stroke={strokeSecondary} strokeWidth={1.5} />
              <ellipse cx={0} cy={d*0.18} rx={w*0.42} ry={d*0.3} fill="none" stroke={strokePrimary} strokeWidth={2} />
              <ellipse cx={0} cy={d*0.18} rx={w*0.3} ry={d*0.2} fill="none" stroke="#64748b" strokeWidth={1} />
            </>
          );
        case 'plant':
          return (
            <>
              <circle cx={0} cy={0} r={w/3} fill="none" stroke="#10b981" strokeWidth={2} />
              <path d="M 0,0 C -6,-18 -22,-24 -32,-18" stroke="#10b981" strokeWidth={1.5} fill="none" />
              <path d="M 0,0 C 6,-18 22,-24 32,-18" stroke="#10b981" strokeWidth={1.5} fill="none" />
              <path d="M 0,0 C -18,6 -24,22 -18,32" stroke="#10b981" strokeWidth={1.5} fill="none" />
              <path d="M 0,0 C 18,6 24,22 18,32" stroke="#10b981" strokeWidth={1.5} fill="none" />
              <path d="M 0,0 C -12,-12 -28,0 -24,18" stroke="#10b981" strokeWidth={1.5} fill="none" />
              <path d="M 0,0 C 12,-12 28,0 24,18" stroke="#10b981" strokeWidth={1.5} fill="none" />
            </>
          );
        case 'tv':
          return (
            <>
              <rect x={-w/2} y={-d/2} width={w} height={d} rx={2} fill="none" stroke={strokePrimary} strokeWidth={2} />
              <rect x={-w*0.38} y={-3} width={w*0.76} height={6} rx={1} fill="rgba(11, 15, 25, 0.9)" stroke={strokePrimary} strokeWidth={1} />
            </>
          );
        case 'door':
          return (
            <>
              <path d={`M ${-w/2} ${-w} A ${w} ${w} 0 0 1 ${w/2} 0`} fill="none" stroke={strokePrimary} strokeWidth={1.5} strokeDasharray="3,3" />
              <line x1={-w/2} y1={0} x2={-w/2} y2={-w} stroke="#6366f1" strokeWidth={3} />
              <line x1={-w/2} y1={0} x2={w/2} y2={0} stroke="#94a3b8" strokeWidth={1.5} />
              <circle cx={-w/2} cy={0} r={4} fill="#6366f1" />
            </>
          );
        case 'window':
          return (
            <>
              <rect x={-w/2} y={-d/2} width={w} height={d} fill="none" stroke="#38bdf8" strokeWidth={2} />
              <line x1={-w/2} y1={0} x2={w/2} y2={0} stroke="#38bdf8" strokeWidth={1.5} />
              <line x1={-w/2} y1={-3} x2={w/2} y2={-3} stroke="#38bdf8" strokeWidth={1} />
              <line x1={-w/2} y1={3} x2={w/2} y2={3} stroke="#38bdf8" strokeWidth={1} />
            </>
          );
        case 'door_slide':
          return (
            <>
              <line x1={-w/2} y1={0} x2={w/2} y2={0} stroke="#94a3b8" strokeWidth={1.5} />
              <rect x={-w/2} y={-3} width={w*0.48} height={6} rx={1} fill="none" stroke={strokePrimary} strokeWidth={1.5} />
              <rect x={2} y={-3} width={w*0.48} height={6} rx={1} fill="none" stroke={strokePrimary} strokeWidth={1.5} />
              <path d={`M ${-w/4} -6 L ${-w/4 - 10} -6 M ${w/4} 6 L ${w/4 + 10} 6`} stroke="#6366f1" strokeWidth={1} />
            </>
          );
        case 'stairs_spiral':
          return (
            <>
              <circle cx={0} cy={0} r={w/2} fill="none" stroke={strokePrimary} strokeWidth={2} />
              <circle cx={0} cy={0} r={8} fill={strokeWhite} />
              {Array.from({ length: 12 }).map((_, i) => {
                const angleRad = (i * 30 * Math.PI) / 180;
                const x2 = (w/2) * Math.cos(angleRad);
                const y2 = (w/2) * Math.sin(angleRad);
                return <line key={i} x1={0} y1={0} x2={x2} y2={y2} stroke={strokeSecondary} strokeWidth={1} />;
              })}
              <path d={`M 0 0 A ${w/3} ${w/3} 0 0 1 ${w*0.25} ${w*0.25}`} fill="none" stroke="#6366f1" strokeWidth={1.5} />
            </>
          );
        case 'stairs_l':
          return (
            <>
              <rect x={-w/2} y={-d/2} width={w} height={d} rx={2} fill="none" stroke={strokePrimary} strokeWidth={2} />
              {Array.from({ length: 6 }).map((_, i) => {
                const stepY = -d/2 + (d * 0.5 / 6) * i;
                return <line key={i} x1={-w/2} y1={stepY} x2={-w/2 + w*0.5} y2={stepY} stroke={strokeSecondary} strokeWidth={1} />;
              })}
              {Array.from({ length: 6 }).map((_, i) => {
                const stepX = -w/2 + w*0.5 + (w * 0.5 / 6) * i;
                return <line key={i} x1={stepX} y1={d/2 - d*0.5} x2={stepX} y2={d/2} stroke={strokeSecondary} strokeWidth={1} />;
              })}
              <rect x={-w/2} y={0} width={w*0.5} height={d*0.5} fill="none" stroke={strokeSecondary} strokeWidth={1} />
              <path d={`M ${-w/4} ${-d/3} L ${-w/4} ${d/4} L ${w/3} ${d/4}`} fill="none" stroke="#6366f1" strokeWidth={2} />
            </>
          );
        case 'sink_bath':
          return (
            <>
              <rect x={-w/2} y={-d/2} width={w} height={d} rx={d/2} fill="none" stroke={strokePrimary} strokeWidth={2} />
              <ellipse cx={0} cy={0} rx={w*0.3} ry={d*0.25} fill="none" stroke={strokeSecondary} strokeWidth={1.5} />
              <circle cx={0} cy={-d*0.25} r={3} fill={strokeSecondary} />
              <line x1={0} y1={-d/2} x2={0} y2={-d*0.25} stroke={strokeWhite} strokeWidth={2} />
            </>
          );
        case 'shower':
          return (
            <>
              <rect x={-w/2} y={-d/2} width={w} height={d} fill="none" stroke={strokePrimary} strokeWidth={2} />
              <line x1={-w/2} y1={-d/2} x2={w/2} y2={d/2} stroke={strokeSecondary} strokeWidth={1} strokeDasharray="3,3" />
              <line x1={-w/2} y1={d/2} x2={w/2} y2={-d/2} stroke={strokeSecondary} strokeWidth={1} strokeDasharray="3,3" />
              <circle cx={0} cy={0} r={10} fill="none" stroke="#6366f1" strokeWidth={1.5} />
              <circle cx={0} cy={0} r={2} fill="#6366f1" />
            </>
          );
        default:
          return null;
      }
    };

    return (
      <svg
        viewBox={`${minX} ${minY} ${width} ${height}`}
        style={{ width: '100%', height: '100%', display: 'block', margin: '0 auto', background: '#ffffff' }}
      >
        <defs>
          <pattern id="print-grid-pattern-minor" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(99, 102, 241, 0.05)" strokeWidth={0.5} />
          </pattern>
          <pattern id="print-grid-pattern-major" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#print-grid-pattern-minor)" />
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(99, 102, 241, 0.1)" strokeWidth={1} />
          </pattern>
        </defs>

        <rect x={minX} y={minY} width={width} height={height} fill="url(#print-grid-pattern-major)" />

        {/* WALLS */}
        {layout.walls.map(wall => {
          const { ctrlX, ctrlY, curveMidX, curveMidY, nx, ny, approxLength, len } = getWallBezierParams(wall);
          const lengthM = (approxLength / 100).toFixed(2);
          let angle = 0;
          if (len > 0) {
            angle = Math.atan2(wall.y2 - wall.y1, wall.x2 - wall.x1) * 180 / Math.PI;
            if (angle > 90 || angle < -90) angle += 180;
          }
          const offsetX = -ny * 16;
          const offsetY = nx * 16;
          const hasCurve = wall.curve && wall.curve !== 0;
          const pathData = hasCurve 
            ? `M ${wall.x1} ${wall.y1} Q ${ctrlX} ${ctrlY} ${wall.x2} ${wall.y2}`
            : `M ${wall.x1} ${wall.y1} L ${wall.x2} ${wall.y2}`;

          return (
            <g key={wall.id}>
              <path d={pathData} fill="none" stroke="#334155" strokeWidth={wall.thickness} strokeLinecap="round" />
              {approxLength > 30 && (
                <text
                  x={curveMidX + offsetX}
                  y={curveMidY + offsetY}
                  transform={`rotate(${angle}, ${curveMidX + offsetX}, ${curveMidY + offsetY})`}
                  fill="#475569"
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="middle"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {lengthM} m
                </text>
              )}
            </g>
          );
        })}

        {/* ITEMS */}
        {layout.items.map(item => {
          const transform = `translate(${item.x}, ${item.y}) rotate(${item.rotation})`;
          const widthM = (item.width / 100).toFixed(2);
          const depthM = (item.depth / 100).toFixed(2);
          const isText = item.type === 'text';
          const scaleX = item.flipX ? -1 : 1;
          const scaleY = item.flipY ? -1 : 1;

          return (
            <g key={item.id} transform={transform}>
              {isText ? (
                <text
                  x={0}
                  y={0}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={item.color === '#ffffff' || item.color === '#f8fafc' || !item.color ? '#0f172a' : item.color}
                  fontSize={item.fontSize || 16}
                  fontWeight="600"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {item.name}
                </text>
              ) : (
                <>
                  <g transform={`scale(${scaleX}, ${scaleY})`}>
                    <rect
                      x={-item.width / 2}
                      y={-item.depth / 2}
                      width={item.width}
                      height={item.depth}
                      rx={4}
                      fill={item.color || '#cbd5e1'}
                      fillOpacity={0.35}
                      stroke={item.color || '#475569'}
                    />
                    {renderPrintFurnitureGraphic(item)}
                  </g>
                  {item.width > 50 && item.depth > 35 && (
                    <g>
                      <text x={0} y={item.depth > 55 ? -2 : 4} fill="#0f172a" stroke="#ffffff" strokeWidth={3} paintOrder="stroke fill" strokeLinejoin="round" fontSize="11" fontWeight="600" textAnchor="middle" style={{ pointerEvents: 'none', userSelect: 'none' }}>
                        {item.name}
                      </text>
                      {item.depth > 55 && (
                        <text x={0} y={11} fill="#475569" stroke="#ffffff" strokeWidth={2} paintOrder="stroke fill" strokeLinejoin="round" fontSize="9" textAnchor="middle" style={{ pointerEvents: 'none', userSelect: 'none' }}>
                          {widthM} x {depthM} m
                        </text>
                      )}
                    </g>
                  )}
                </>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  const getPrintPages = () => {
    const pages: {
      title: string;
      layouts: { subtitle: string; layout: LayoutState }[];
    }[] = [];

    const targetFloors = project.floors.filter(floor => {
      if (printFloorsOption === 'all') return true;
      return printSelectedFloorIds.includes(floor.id);
    });

    if (printLayoutsOption === 'both') {
      if (printBothOrder === 'sequence') {
        targetFloors.forEach(floor => {
          pages.push({
            title: `Pavimento: ${floor.name}`,
            layouts: [
              { subtitle: 'Layout Atual (Antes)', layout: floor.before },
              { subtitle: 'Layout Proposto (Depois)', layout: floor.after }
            ]
          });
        });
      } else {
        targetFloors.forEach(floor => {
          pages.push({
            title: `Pavimento: ${floor.name} - Layout Atual (Antes)`,
            layouts: [{ subtitle: 'Antes', layout: floor.before }]
          });
        });
        targetFloors.forEach(floor => {
          pages.push({
            title: `Pavimento: ${floor.name} - Layout Proposto (Depois)`,
            layouts: [{ subtitle: 'Depois', layout: floor.after }]
          });
        });
      }
    } else if (printLayoutsOption === 'before') {
      targetFloors.forEach(floor => {
        pages.push({
          title: `Pavimento: ${floor.name} - Layout Atual (Antes)`,
          layouts: [{ subtitle: 'Antes', layout: floor.before }]
        });
      });
    } else {
      targetFloors.forEach(floor => {
        pages.push({
          title: `Pavimento: ${floor.name} - Layout Proposto (Depois)`,
          layouts: [{ subtitle: 'Depois', layout: floor.after }]
        });
      });
    }

    return pages;
  };

  // --- SVG GRID DEF ---
  const renderSvgGrid = () => {
    return (
      <defs>
        <pattern id="grid-pattern-minor" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" className="grid-minor" />
        </pattern>
        <pattern id="grid-pattern-major" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="url(#grid-pattern-minor)" />
          <path d="M 100 0 L 0 0 0 100" fill="none" className="grid-major" />
        </pattern>
      </defs>
    );
  };

  // --- RENDER INNER CANVAS CONTENT ---
  const renderSvgContent = (layoutToShow: LayoutState, svgRefInstance: React.MutableRefObject<SVGSVGElement | null>, readOnly: boolean = false) => {
    // 1. Drawing Wall Preview
    let previewWall: React.ReactNode = null;
    if (!readOnly && tool === 'wall' && drawingWallStart) {
      let previewX = snapValue(mousePos.x);
      let previewY = snapValue(mousePos.y);
      
      if (mousePos.x !== 0 && mousePos.y !== 0) {
        // Shift constrained snapping
        // Checked in window key event listener or mouse down
      }

      const distanceM = (getDistance(drawingWallStart.x, drawingWallStart.y, previewX, previewY) / 100).toFixed(2);
      const mx = (drawingWallStart.x + previewX) / 2;
      const my = (drawingWallStart.y + previewY) / 2;
      
      previewWall = (
        <g>
          <line
            x1={drawingWallStart.x}
            y1={drawingWallStart.y}
            x2={previewX}
            y2={previewY}
            stroke="var(--color-primary)"
            strokeWidth={15}
            strokeDasharray="4,4"
            opacity={0.6}
            strokeLinecap="round"
          />
          <circle cx={drawingWallStart.x} cy={drawingWallStart.y} r={6} fill="var(--color-primary)" />
          <circle cx={previewX} cy={previewY} r={6} fill="var(--color-primary)" />
          <text x={mx} y={my - 18} className="wall-cota-text" fill="var(--color-primary)" fontSize={12} fontWeight={600} textAnchor="middle">
            {distanceM} m
          </text>
        </g>
      );
    }

    return (
      <svg
        ref={svgRefInstance}
        className={`canvas-svg ${!readOnly && tool === 'wall' ? 'tool-wall' : ''} ${!readOnly && tool === 'pan' ? (isPanning ? 'tool-pan-grabbing' : 'tool-pan') : ''}`}
        onMouseDown={(e) => !readOnly && handleMouseDown(e, svgRefInstance.current)}
        onMouseMove={(e) => !readOnly && handleMouseMove(e, svgRefInstance.current)}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {renderSvgGrid()}

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          <rect
            id="grid-background"
            x="-10000"
            y="-10000"
            width="20000"
            height="20000"
            fill="url(#grid-pattern-major)"
          />

          {/* RENDERING WALLS */}
          {layoutToShow.walls.map(wall => {
            const isSelected = !readOnly && (selectedWallId === wall.id || selectedWallIds.includes(wall.id));
            
            // Calculate bezier variables
            const { ctrlX, ctrlY, curveMidX, curveMidY, nx, ny, approxLength, len } = getWallBezierParams(wall);
            const lengthM = (approxLength / 100).toFixed(2);

            let angle = 0;
            if (len > 0) {
              angle = Math.atan2(wall.y2 - wall.y1, wall.x2 - wall.x1) * 180 / Math.PI;
              if (angle > 90 || angle < -90) {
                angle += 180;
              }
            }

            // Normal offset for length label placement
            const offsetX = -ny * 16;
            const offsetY = nx * 16;

            // Render wall as curved path if curve is non-zero, else draw straight line
            const hasCurve = wall.curve && wall.curve !== 0;
            const pathData = hasCurve 
              ? `M ${wall.x1} ${wall.y1} Q ${ctrlX} ${ctrlY} ${wall.x2} ${wall.y2}`
              : `M ${wall.x1} ${wall.y1} L ${wall.x2} ${wall.y2}`;

            return (
              <g key={wall.id}>
                {/* SVG path representing wall layout */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isSelected ? 'var(--color-primary)' : (theme === 'light' ? '#334155' : 'rgba(248, 250, 252, 0.85)')}
                  strokeWidth={wall.thickness}
                  strokeLinecap="round"
                  className="wall-line"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  onMouseDown={(e) => {
                    if (readOnly || tool !== 'select') return;
                    e.stopPropagation();
                    
                    const isMulti = e.shiftKey || e.metaKey || e.ctrlKey;
                    setSelectedItemId(null);
                    setSelectedItemIds([]);
                    
                    const coords = getCanvasCoords(e.clientX, e.clientY, svgRefInstance.current);
                    
                    let activeSelectedIds = [...selectedWallIds];
                    const isAlreadySelected = selectedWallIds.includes(wall.id);
                    
                    const relatedIds: string[] = [];
                    if (wall.groupId) {
                      layoutToShow.walls.forEach(w => {
                        if (w.groupId === wall.groupId) {
                          relatedIds.push(w.id);
                        }
                      });
                    } else {
                      relatedIds.push(wall.id);
                    }

                    if (isMulti) {
                      if (isAlreadySelected) {
                        activeSelectedIds = selectedWallIds.filter(id => !relatedIds.includes(id));
                        setSelectedWallIds(activeSelectedIds);
                        setSelectedWallId(activeSelectedIds.length > 0 ? activeSelectedIds[activeSelectedIds.length - 1] : null);
                        return;
                      } else {
                        activeSelectedIds = Array.from(new Set([...selectedWallIds, ...relatedIds]));
                        setSelectedWallIds(activeSelectedIds);
                        setSelectedWallId(wall.id);
                      }
                    } else {
                      if (!isAlreadySelected) {
                        activeSelectedIds = relatedIds;
                        setSelectedWallIds(relatedIds);
                        setSelectedWallId(wall.id);
                      }
                    }

                    // Setup drag offsets for all walls in active selection
                    setIsDraggingWall(true);
                    setDraggedWallId(wall.id);
                    
                    const startPosMap: { [id: string]: { x1: number; y1: number; x2: number; y2: number } } = {};
                    activeSelectedIds.forEach(id => {
                      const found = layoutToShow.walls.find(w => w.id === id);
                      if (found) {
                        startPosMap[id] = { x1: found.x1, y1: found.y1, x2: found.x2, y2: found.y2 };
                      }
                    });
                    setDraggedWallsStartPos(startPosMap);

                    // Set standard offset for the principal dragged wall
                    setWallDragStartOffset({
                      x1: coords.x - wall.x1,
                      y1: coords.y - wall.y1,
                      x2: coords.x - wall.x2,
                      y2: coords.y - wall.y2
                    });
                  }}
                />

                {/* Wall Length dimension cota label */}
                {approxLength > 30 && (
                  <text
                    x={curveMidX + offsetX}
                    y={curveMidY + offsetY}
                    transform={`rotate(${angle}, ${curveMidX + offsetX}, ${curveMidY + offsetY})`}
                    className="wall-cota-text"
                    fill={isSelected ? 'var(--color-primary)' : (theme === 'light' ? '#475569' : 'rgba(255, 255, 255, 0.45)')}
                    fontSize="11"
                    fontWeight="500"
                    textAnchor="middle"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {lengthM} m
                  </text>
                )}

                {/* Node handles visible only on selection */}
                {isSelected && (
                  <>
                    {/* Node 1 handle */}
                    <circle
                      cx={wall.x1}
                      cy={wall.y1}
                      r={7}
                      className="wall-node-handle"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setDraggingWallNode({ wallId: wall.id, nodeIndex: 1 });
                      }}
                    />
                    
                    {/* Node 2 handle */}
                    <circle
                      cx={wall.x2}
                      cy={wall.y2}
                      r={7}
                      className="wall-node-handle"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setDraggingWallNode({ wallId: wall.id, nodeIndex: 2 });
                      }}
                    />

                    {/* Curve center handle */}
                    <circle
                      cx={curveMidX}
                      cy={curveMidY}
                      r={6}
                      fill="var(--color-warning)"
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      cursor="ns-resize"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsDraggingWallCurve(true);
                        setDraggedWallCurveId(wall.id);
                      }}
                    >
                      <title>Arraste para curvar a parede</title>
                    </circle>
                  </>
                )}
              </g>
            );
          })}

          {previewWall}

          {/* RENDERING CANVAS ITEMS */}
          {layoutToShow.items.map(item => {
            const isSelected = !readOnly && selectedItemIds.includes(item.id);
            const transform = `translate(${item.x}, ${item.y}) rotate(${item.rotation})`;
            const widthM = (item.width / 100).toFixed(2);
            const depthM = (item.depth / 100).toFixed(2);

            const isText = item.type === 'text';
            const scaleX = item.flipX ? -1 : 1;
            const scaleY = item.flipY ? -1 : 1;

            return (
              <g
                key={item.id}
                className={`canvas-item-group ${isSelected ? 'selected' : ''}`}
                transform={transform}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onMouseDown={(e) => {
                  if (readOnly || tool !== 'select') return;
                  e.stopPropagation();
                  
                  const isMulti = e.shiftKey || e.metaKey || e.ctrlKey;
                  setSelectedWallId(null);
                  setSelectedWallIds([]);
                  
                  const coords = getCanvasCoords(e.clientX, e.clientY, svgRefInstance.current);
                  
                  let activeSelectedIds = [...selectedItemIds];
                  const isAlreadySelected = selectedItemIds.includes(item.id);
                  
                  const relatedIds: string[] = [];
                  if (item.groupId) {
                    layoutToShow.items.forEach(it => {
                      if (it.groupId === item.groupId) {
                        relatedIds.push(it.id);
                      }
                    });
                  } else {
                    relatedIds.push(item.id);
                  }

                  if (isMulti) {
                    if (isAlreadySelected) {
                      activeSelectedIds = selectedItemIds.filter(id => !relatedIds.includes(id));
                      setSelectedItemIds(activeSelectedIds);
                      setSelectedItemId(activeSelectedIds.length > 0 ? activeSelectedIds[activeSelectedIds.length - 1] : null);
                      return;
                    } else {
                      activeSelectedIds = Array.from(new Set([...selectedItemIds, ...relatedIds]));
                      setSelectedItemIds(activeSelectedIds);
                      setSelectedItemId(item.id);
                    }
                  } else {
                    if (!isAlreadySelected) {
                      activeSelectedIds = relatedIds;
                      setSelectedItemIds(relatedIds);
                      setSelectedItemId(item.id);
                    }
                  }

                  setIsDraggingItem(true);
                  setDraggedItemId(item.id);

                  const startPosMap: { [itemId: string]: { x: number; y: number } } = {};
                  activeSelectedIds.forEach(id => {
                    const found = layoutToShow.items.find(it => it.id === id);
                    if (found) {
                      startPosMap[id] = { x: found.x, y: found.y };
                    }
                  });
                  setDraggedItemsStartPos(startPosMap);

                  setDragStartOffset({
                    x: coords.x - item.x,
                    y: coords.y - item.y
                  });
                }}
              >
                {/* Visual rendering for Text Annotations */}
                {isText ? (
                  <>
                    {/* Outline box visible only when selected to make dragging easy */}
                    {isSelected && (
                      <rect
                        x={-item.width / 2}
                        y={-item.depth / 2}
                        width={item.width}
                        height={item.depth}
                        fill="none"
                        stroke="var(--color-primary)"
                        strokeWidth={1}
                        strokeDasharray="3,3"
                      />
                    )}
                    <text
                      x={0}
                      y={0}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={
                        theme === 'light'
                          ? (item.color === '#ffffff' || item.color === '#f8fafc' || !item.color
                              ? '#0f172a'
                              : item.color)
                          : (item.color || '#f8fafc')
                      }
                      fontSize={item.fontSize || 16}
                      fontWeight="600"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {item.name}
                    </text>
                  </>
                ) : (
                  // Visual rendering for standard Furniture presets
                  <>
                    <g transform={`scale(${scaleX}, ${scaleY})`}>
                      <rect
                        x={-item.width / 2}
                        y={-item.depth / 2}
                        width={item.width}
                        height={item.depth}
                        rx={4}
                        fill={item.color || (theme === 'light' ? '#cbd5e1' : '#334155')}
                        fillOpacity={theme === 'light' ? 0.35 : 0.15}
                        stroke={item.color || (theme === 'light' ? '#475569' : '#94a3b8')}
                        className="canvas-item-rect"
                      />

                      {renderFurnitureGraphic(item)}
                    </g>

                    {item.width > 50 && item.depth > 35 && (
                      <g>
                        <text
                          x={0}
                          y={item.depth > 55 ? -2 : 4}
                          className="item-label"
                        >
                          {item.name}
                        </text>
                        {item.depth > 55 && (
                          <text
                            x={0}
                            y={11}
                            className="item-sublabel"
                          >
                            {widthM} x {depthM} m
                          </text>
                        )}
                      </g>
                    )}
                  </>
                )}

                {/* Visual rendering for highlight when selected */}
                {isSelected && (
                  <rect
                    x={-item.width / 2 - 4}
                    y={-item.depth / 2 - 4}
                    width={item.width + 8}
                    height={item.depth + 8}
                    rx={4}
                    fill="rgba(99, 102, 241, 0.08)"
                    stroke="#6366f1"
                    strokeWidth={2}
                    strokeDasharray="4, 4"
                    className="selection-highlight-rect"
                    style={{ pointerEvents: 'none' }}
                  />
                )}
              </g>
            );
          })}

          {/* ROTATION GIZMO FOR SELECTED ITEM */}
          {selectedItem && !readOnly && (
            (() => {
              const hinge = getItemHingeOffset(selectedItem);
              const rad = (selectedItem.rotation * Math.PI) / 180;
              const borderTopX = selectedItem.x + (selectedItem.depth / 2) * Math.sin(rad);
              const borderTopY = selectedItem.y - (selectedItem.depth / 2) * Math.cos(rad);

              return (
                <g>
                  <line
                    x1={borderTopX}
                    y1={borderTopY}
                    x2={hinge.x}
                    y2={hinge.y}
                    className="gizmo-rotate-line"
                  />
                  <circle
                    cx={hinge.x}
                    cy={hinge.y}
                    r={9}
                    className="gizmo-rotate-handle"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setIsRotating(true);
                      setRotatingItemId(selectedItem.id);
                    }}
                  />
                </g>
              );
            })()
          )}
          {/* Selection Box overlay */}
          {!readOnly && isSelectingBox && selectionBoxStart && selectionBoxEnd && (
            <rect
              x={Math.min(selectionBoxStart.x, selectionBoxEnd.x)}
              y={Math.min(selectionBoxStart.y, selectionBoxEnd.y)}
              width={Math.abs(selectionBoxEnd.x - selectionBoxStart.x)}
              height={Math.abs(selectionBoxEnd.y - selectionBoxStart.y)}
              fill="rgba(99, 102, 241, 0.12)"
              stroke="var(--color-primary)"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              pointerEvents="none"
            />
          )}
        </g>
      </svg>
    );
  };

  return (
    <div className="app-container" ref={containerRef}>
      {/* Header bar */}
      <header className="app-header">
        <div className="logo-section" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Maximize2 className="logo-icon" size={22} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <input
              type="text"
              value={project.name}
              onChange={(e) => commitProjectChange({ ...project, name: e.target.value })}
              className="project-title-input"
              style={{
                background: 'none',
                border: 'none',
                borderBottom: '1px dashed rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontWeight: '600',
                outline: 'none',
                padding: '1px 4px',
                width: '180px',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderBottomColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderBottomColor = 'rgba(255, 255, 255, 0.25)'}
              title="Clique para renomear o projeto"
            />
            <span style={{ fontSize: '0.6rem', color: 'var(--color-success)', marginLeft: '4px', fontWeight: '500' }}>
              ● Salvo automaticamente
            </span>
          </div>
        </div>

        <div className="header-center">
          {/* Floor select dropdown */}
          <div className="floor-selector-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Andar:</span>
            <select
              value={currentFloorId}
              onChange={(e) => {
                setCurrentFloorId(e.target.value);
                setSelectedItemId(null);
                setSelectedWallId(null);
              }}
              className="input-styled"
              style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', width: '150px', cursor: 'pointer', height: '32px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: '#1e293b', color: '#f1f5f9' }}
            >
              {project.floors.map(floor => (
                <option key={floor.id} value={floor.id}>
                  {floor.name}
                </option>
              ))}
            </select>
            {project.floors.length > 1 && (
              <button
                className="btn btn-secondary"
                onClick={() => handleDeleteFloor(currentFloorId)}
                title="Excluir pavimento ativo"
                style={{ padding: '0.35rem 0.55rem', height: '32px', color: 'var(--color-danger)', borderColor: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                🗑
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handlePromptAddFloor}
              title="Adicionar novo pavimento/andar"
              style={{ padding: '0.35rem 0.6rem', height: '32px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <Plus size={13} />
              + Novo
            </button>
          </div>

          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)' }} />

          {/* Layout version selector tabs */}
          <div className="version-selector">
            <button
              className={`version-btn ${currentVersion === 'before' ? 'active before' : ''}`}
              onClick={() => {
                setCurrentVersion('before');
                setSelectedItemId(null);
                setSelectedWallId(null);
              }}
            >
              <span className="version-badge before"></span>
              Layout Atual (Antes)
            </button>
            <button
              className={`version-btn ${currentVersion === 'after' ? 'active after' : ''}`}
              onClick={() => {
                setCurrentVersion('after');
                setSelectedItemId(null);
                setSelectedWallId(null);
              }}
            >
              <span className="version-badge after"></span>
              Layout Proposto (Depois)
            </button>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="btn"
            onClick={handleNewProject}
            title="Criar novo projeto em branco"
          >
            <Plus size={15} />
            Novo
          </button>
          <button
            className="btn"
            onClick={handleOpenProjects}
            title="Abrir projetos salvos"
          >
            <Upload size={15} />
            Abrir
          </button>
          <button
            className="btn"
            onClick={handleExportProject}
            title="Exportar projeto como arquivo JSON"
          >
            <Download size={15} />
            Exportar
          </button>
          <label className="btn" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', margin: 0 }} title="Importar projeto de arquivo JSON">
            <Upload size={15} />
            Importar
            <input
              type="file"
              accept=".json"
              onChange={handleImportProject}
              style={{ display: 'none' }}
            />
          </label>
          <button
            className="btn btn-primary"
            onClick={handleSaveProjectManual}
            title="Salvar projeto no servidor (Ctrl+S / ⌘S)"
            style={{ fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <Save size={15} />
            {saveStatus === 'saving' ? 'Salvando...' : saveStatus === 'saved' ? '✓ Salvo!' : 'Salvar'}
          </button>
          <button
            className="btn"
            onClick={() => { setSaveAsNameInput(project.name + ' (cópia)'); setIsSaveAsModalOpen(true); }}
            title="Salvar como novo projeto com outro nome"
          >
            <SaveAll size={15} />
            Salvar como
          </button>
          <button
            className="btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? "Ativar Modo Claro (Fundo Branco)" : "Ativar Modo Escuro"}
            style={{ padding: '0.4rem', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            className="btn"
            onClick={() => setIsPrintModalOpen(true)}
            title="Gerar versão de impressão e imprimir"
            style={{ padding: '0.4rem', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Printer size={16} />
          </button>
          <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }} />
          <div className="profile-menu-container" style={{ position: 'relative' }}>
            <button
              className="profile-avatar"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              title={`Conta: ${user.name}`}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </button>

            {isProfileDropdownOpen && (
              <>
                <div 
                  style={{ position: 'fixed', inset: 0, zIndex: 998 }} 
                  onClick={() => setIsProfileDropdownOpen(false)} 
                />
                <div
                  className="profile-dropdown"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    backgroundColor: '#111827',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem',
                    minWidth: '180px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    zIndex: 999,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: '600', color: '#f3f4f6' }}>{user.name}</span>
                    <span style={{ fontSize: '0.68rem', color: '#9ca3af', wordBreak: 'break-all' }}>{user.email}</span>
                  </div>
                  <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      onLogout();
                    }}
                    style={{ padding: '0.35rem', fontSize: '0.75rem', width: '100%', justifyContent: 'center' }}
                  >
                    Sair da Conta
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Editor Workspace panels */}
      <div className="workspace">
        {/* Sidebar Left: presets & item catalog */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h3>
              <Plus size={18} className="logo-icon" />
              Catálogo de Móveis
            </h3>
          </div>
          <div className="sidebar-content">
            {/* Version syncing utilities */}
            <div className="panel-section" style={{ backgroundColor: 'rgba(99, 102, 241, 0.05)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
              <span className="section-title" style={{ color: 'var(--color-primary)' }}>Sincronizar Antes/Depois</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.2rem' }}>
                <button
                  className="btn btn-primary"
                  onClick={copyBeforeToAfter}
                  style={{ padding: '0.4rem 0.5rem', fontSize: '0.75rem', width: '100%', gap: '0.25rem' }}
                  title="Clona o estado do 'Antes' para o 'Depois' no pavimento ativo"
                >
                  <Copy size={12} />
                  Copiar Antes → Depois
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={copyAfterToBefore}
                  style={{ padding: '0.4rem 0.5rem', fontSize: '0.75rem', width: '100%', gap: '0.25rem' }}
                  title="Clona o estado do 'Depois' para o 'Antes' no pavimento ativo"
                >
                  <Copy size={12} />
                  Copiar Depois → Antes
                </button>
              </div>
            </div>

            {/* Presets catalog list */}
            <div className="panel-section">
              <span className="section-title">Biblioteca de Modelos</span>
              
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem', display: 'block' }}>Filtrar por Cômodo / Categoria</label>
                <select
                  value={catalogCategory}
                  onChange={(e) => setCatalogCategory(e.target.value)}
                  className="input-styled"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
                >
                  <option value="basics">Itens Básicos (Portas, Janelas, Escadas)</option>
                  <option value="living">Sala</option>
                  <option value="kitchen">Cozinha</option>
                  <option value="bathroom">Banheiro</option>
                  <option value="custom">Objetos Personalizados</option>
                </select>
              </div>

              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Clique para inserir no centro da planta do pavimento atual.
              </p>
              
              <button
                className="btn btn-secondary"
                onClick={handleAddTextAnnotation}
                style={{ width: '100%', marginBottom: '0.75rem', justifyContent: 'center', gap: '0.4rem' }}
                title="Escrever nomes de cômodos ou identificadores livremente"
              >
                <Type size={16} />
                Inserir Texto / Anotação
              </button>

              <div className="presets-grid">
                {(() => {
                  let list: any[] = [];
                  if (catalogCategory === 'custom') {
                    list = [
                      ...(project.customPresets || []).map(p => ({ ...p, isProjectPreset: true })),
                      ...globalPresets.map(p => ({ ...p, isGlobalPreset: true }))
                    ];
                  } else {
                    list = CATALOG_ITEMS.filter(item => item.category === catalogCategory);
                  }

                  if (list.length === 0) {
                    return (
                      <div style={{ gridColumn: '1 / span 2', textAlign: 'center', padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Nenhum item personalizado criado ainda. Crie um item abaixo!
                      </div>
                    );
                  }

                  return list.map((preset, index) => {
                    const isCustom = preset.isProjectPreset || preset.isGlobalPreset;
                    return (
                      <div
                        key={index}
                        className={`preset-card ${isCustom ? 'custom-preset-card' : ''}`}
                        onClick={() => handleAddItem(preset)}
                      >
                        {isCustom && (
                          <button
                            className="preset-delete-btn"
                            onClick={(e) => handleDeleteCustomPreset(preset, e)}
                            title={`Excluir modelo personalizado (${preset.isProjectPreset ? 'Este projeto' : 'Global'})`}
                          >
                            ✕
                          </button>
                        )}
                        <div className="preset-icon-wrapper">
                          {preset.icon === 'door' ? '🚪' : preset.icon === 'door_slide' ? '🚪⇄' : preset.icon === 'window' ? '🪟' : preset.icon === 'sofa' ? '🛋️' : preset.icon === 'table' ? '🪑' : preset.icon === 'stairs' ? '🪜' : preset.icon === 'stairs_spiral' ? '🌀' : preset.icon === 'stairs_l' ? '📐' : preset.icon === 'toilet' ? '🚽' : preset.icon === 'sink_bath' ? '🧽' : preset.icon === 'shower' ? '🚿' : '📦'}
                        </div>
                        <span className="preset-name">{preset.name}</span>
                        <span className="preset-dims">{preset.width / 100}x{preset.depth / 100} m</span>
                        {isCustom && (
                          <span className={`preset-badge ${preset.isProjectPreset ? 'badge-project' : 'badge-global'}`}>
                            {preset.isProjectPreset ? 'Projeto' : 'Global'}
                          </span>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Custom furniture builder */}
            <div className="panel-section" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1.25rem' }}>
              <span className="section-title">Criar Item Sob Medida</span>
              
              <div className="form-group">
                <label>Nome do Item</label>
                <input
                  type="text"
                  value={newFurniture.name}
                  onChange={(e) => setNewFurniture({ ...newFurniture, name: e.target.value })}
                  className="input-styled"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Largura (cm)</label>
                  <input
                    type="number"
                    value={newFurniture.width}
                    onChange={(e) => setNewFurniture({ ...newFurniture, width: parseInt(e.target.value) || 0 })}
                    className="input-styled"
                    min="10"
                    max="1000"
                  />
                </div>
                <div className="form-group">
                  <label>Profundidade (cm)</label>
                  <input
                    type="number"
                    value={newFurniture.depth}
                    onChange={(e) => setNewFurniture({ ...newFurniture, depth: parseInt(e.target.value) || 0 })}
                    className="input-styled"
                    min="10"
                    max="1000"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Categoria</label>
                  <select
                    value={newFurniture.type}
                    onChange={(e) => {
                      const val = e.target.value as 'furniture' | 'door' | 'window' | 'text';
                      let icon = 'table';
                      let color = '#3b82f6';
                      if (val === 'door') { icon = 'door'; color = '#f8fafc'; }
                      else if (val === 'window') { icon = 'window'; color = '#38bdf8'; }
                      else if (val === 'text') { icon = 'text'; color = '#cbd5e1'; }
                      setNewFurniture({ ...newFurniture, type: val, icon, color });
                    }}
                    className="input-styled"
                  >
                    <option value="furniture">Móvel / Objeto</option>
                    <option value="door">Porta</option>
                    <option value="window">Janela</option>
                  </select>
                </div>

                {newFurniture.type === 'furniture' && (
                  <div className="form-group">
                    <label>Representação / Ícone</label>
                    <select
                      value={newFurniture.icon}
                      onChange={(e) => setNewFurniture({ ...newFurniture, icon: e.target.value })}
                      className="input-styled"
                    >
                      <option value="table">Mesa / Balcão</option>
                      <option value="chair">Cadeira</option>
                      <option value="sofa">Sofá</option>
                      <option value="refrigerator">Geladeira</option>
                      <option value="sink">Pia / Cuba</option>
                      <option value="stove">Fogão / Cooktop</option>
                      <option value="toilet">Vaso Sanitário</option>
                      <option value="bed">Cama</option>
                      <option value="plant">Planta / Vaso</option>
                      <option value="tv">Televisão / Painel</option>
                      <option value="stairs">Escada Reta</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Cor do Item</label>
                <div className="color-swatches">
                  {['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#ef4444', '#64748b', '#cbd5e1'].map(colorHex => (
                    <button
                      key={colorHex}
                      className={`color-swatch ${newFurniture.color === colorHex ? 'active' : ''}`}
                      style={{ backgroundColor: colorHex }}
                      onClick={() => setNewFurniture({ ...newFurniture, color: colorHex })}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label>Disponibilidade (Salvar Em)</label>
                <select
                  value={customScope}
                  onChange={(e) => setCustomScope(e.target.value as 'project' | 'global')}
                  className="input-styled"
                >
                  <option value="project">Apenas neste projeto</option>
                  <option value="global">Todos os meus projetos (Memória Global)</option>
                </select>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleCreateCustomFurniture}
                style={{ marginTop: '0.5rem' }}
              >
                <Plus size={16} />
                Adicionar ao Layout
              </button>
            </div>


          </div>
        </aside>

        {/* Center Editor canvas area */}
        <main className="canvas-panel">
          {/* Toolbar */}
          <div className="editor-toolbar">
            <div className="toolbar-group">
              <button
                className={`btn-tool ${tool === 'select' ? 'active' : ''}`}
                onClick={() => { setTool('select'); setDrawingWallStart(null); setIsPanning(false); }}
                title="Selecionar: Clique e arraste para mover/rotacionar objetos"
              >
                <MousePointer size={18} />
              </button>
              <button
                className={`btn-tool ${tool === 'pan' ? 'active' : ''}`}
                onClick={() => { setTool('pan'); setDrawingWallStart(null); setSelectedItemId(null); setSelectedWallId(null); }}
                title="Mão (PAM): Arraste para mover a visão do canvas"
              >
                <Hand size={18} />
              </button>
              <button
                className={`btn-tool ${tool === 'wall' ? 'active' : ''}`}
                onClick={() => { setTool('wall'); setSelectedItemId(null); setSelectedWallId(null); }}
                title="Desenhar Parede: Clique no canvas para colocar vértices. ESC para sair"
              >
                <PenTool size={18} />
              </button>

              <div className="toolbar-divider" />

              {/* Undo / Redo */}
              <button
                className="btn-tool"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                title="Desfazer ação (Ctrl+Z / ⌘Z)"
              >
                <Undo2 size={18} />
              </button>
              <button
                className="btn-tool"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                title="Refazer ação (Ctrl+Y / ⌘Shift+Z)"
              >
                <Redo2 size={18} />
              </button>

              <button
                className="btn-tool"
                onClick={handleCutItems}
                disabled={selectedItemIds.length === 0 && !selectedItemId}
                title="Recortar seleção (Ctrl+X / ⌘X)"
              >
                <Scissors size={18} />
              </button>
              <button
                className="btn-tool"
                onClick={handleCopyItems}
                disabled={selectedItemIds.length === 0 && !selectedItemId}
                title="Copiar seleção (Ctrl+C / ⌘C)"
              >
                <Copy size={18} />
              </button>
              <button
                className="btn-tool"
                onClick={handlePasteItems}
                disabled={clipboard.length === 0}
                title="Colar seleção (Ctrl+V / ⌘V)"
              >
                <Clipboard size={18} />
              </button>

              <div className="toolbar-divider" />

              {/* Snapping controls */}
              <button
                className={`btn-tool ${snapToGrid ? 'active' : ''}`}
                onClick={() => setSnapToGrid(!snapToGrid)}
                title={snapToGrid ? 'Alinhamento na Grade Ativo' : 'Alinhamento Livre'}
              >
                <Grid size={18} />
              </button>

              {snapToGrid && (
                <select
                  value={snapSize}
                  onChange={(e) => setSnapSize(parseInt(e.target.value) || 5)}
                  className="input-styled"
                  style={{ width: '100px', padding: '0.2rem 0.4rem', fontSize: '0.75rem', height: '28px' }}
                >
                  <option value="5">Snap 5cm</option>
                  <option value="10">Snap 10cm</option>
                  <option value="20">Snap 20cm</option>
                  <option value="50">Snap 50cm</option>
                </select>
              )}
            </div>

            <div className="toolbar-group">
              {/* Zoom controls */}
              <button className="btn-tool" onClick={() => handleZoom('out')} title="Diminuir Zoom">
                <ZoomOut size={18} />
              </button>
              <span className="zoom-indicator">{Math.round(zoom * 100)}%</span>
              <button className="btn-tool" onClick={() => handleZoom('in')} title="Aumentar Zoom">
                <ZoomIn size={18} />
              </button>
              <button className="btn-tool" onClick={() => handleZoom('reset')} title="Resetar Camera">
                <Maximize2 size={18} />
              </button>

              <div className="toolbar-divider" />

              {/* Split Screen compare button */}
              <button
                className={`btn ${isSplitView ? 'btn-success' : 'btn-secondary'}`}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                onClick={() => {
                  setIsSplitView(!isSplitView);
                  setSelectedItemId(null);
                  setSelectedWallId(null);
                }}
              >
                <Split size={14} />
                {isSplitView ? 'Ver Tela Única' : 'Comparar Lado a Lado'}
              </button>
            </div>
          </div>

          {/* Canvas display wrapper */}
          {isSplitView ? (
            <div className="split-view-container">
              {/* Left pane: BEFORE version */}
              <div className="split-pane">
                <div className="pane-label-overlay before">Layout Atual (Antes) - {currentFloor.name}</div>
                <div className="canvas-viewport">
                  {renderSvgContent(currentFloor.before, svgRef1, true)}
                </div>
              </div>
              
              {/* Right pane: AFTER version */}
              <div className="split-pane">
                <div className="pane-label-overlay after">Layout Proposto (Depois) - {currentFloor.name}</div>
                <div className="canvas-viewport">
                  {renderSvgContent(currentFloor.after, svgRef2, false)}
                </div>
              </div>
            </div>
          ) : (
            <div className="canvas-viewport">
              {renderSvgContent(currentLayout, svgRef2, false)}
            </div>
          )}

          {/* Guides / hints footer */}
          <footer className="editor-footer">
            <div className="footer-item">
              <Info size={14} style={{ color: 'var(--color-primary)' }} />
              {tool === 'wall' ? (
                <span>
                  <strong>Ferramenta Parede:</strong> Clique no canvas para desenhar. Mantenha <strong>Shift</strong> para travar em 90°. Pressione <strong>ESC</strong> para sair.
                </span>
              ) : (
                <span>
                  <strong>Seleção:</strong> Arraste móveis para posicionar. Clique e arraste <strong>uma parede</strong> para movê-la por inteiro, ou puxe <strong>seus cantos</strong> para alterar medidas. Arraste a <strong>bolinha amarela</strong> para curvar a parede. Pressione <strong>Delete/Backspace</strong> para remover.
                </span>
              )}
            </div>
            <div className="footer-item">
              <span>Pavimento Ativo: <strong>{currentFloor.name}</strong></span>
            </div>
          </footer>
          {!isInspectorExpanded && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsInspectorExpanded(true)}
              title="Expandir Painel de Propriedades"
              style={{
                position: 'absolute',
                top: '4.5rem',
                right: '1rem',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: 'var(--shadow-md)',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <ChevronLeft size={16} />
              <span>Propriedades</span>
            </button>
          )}
        </main>

        {/* Sidebar Right: properties editor */}
        <aside
          className="sidebar right"
          style={
            !isInspectorExpanded
              ? { width: 0, minWidth: 0, padding: 0, border: 'none', overflow: 'hidden' }
              : undefined
          }
        >
          <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
              <Sliders size={18} className="logo-icon" />
              Propriedades
            </h3>
            <button
              type="button"
              onClick={() => setIsInspectorExpanded(false)}
              title="Recolher Painel"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-panel-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="sidebar-content">
            {/* Multi-selection grouping actions */}
            {selectedItemIds.length > 1 && (
              <div className="panel-section" style={{ backgroundColor: 'rgba(99, 102, 241, 0.05)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.15)', marginBottom: '1rem' }}>
                <span className="section-title" style={{ color: 'var(--color-primary)' }}>Ações de Seleção Múltipla</span>
                <p style={{ fontSize: '0.75rem', margin: '0.25rem 0 0.75rem 0', color: 'var(--text-primary)' }}>
                  <strong>{selectedItemIds.length}</strong> itens selecionados.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {!areSelectedItemsGrouped() ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleGroupSelectedItems}
                      style={{ width: '100%', padding: '0.45rem', fontSize: '0.75rem', justifyContent: 'center' }}
                    >
                      Agrupar Objetos (Mover Juntos)
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleUngroupSelectedItems}
                      style={{ width: '100%', padding: '0.45rem', fontSize: '0.75rem', justifyContent: 'center', color: 'var(--color-danger)' }}
                    >
                      Desagrupar Objetos
                    </button>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCopyItems}
                      style={{ flex: 1, padding: '0.45rem', fontSize: '0.75rem', justifyContent: 'center', gap: '0.3rem' }}
                      title="Copiar seleção (Ctrl+C / ⌘C)"
                    >
                      <Copy size={14} />
                      Copiar
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCutItems}
                      style={{ flex: 1, padding: '0.45rem', fontSize: '0.75rem', justifyContent: 'center', gap: '0.3rem' }}
                      title="Recortar seleção (Ctrl+X / ⌘X)"
                    >
                      <Scissors size={14} />
                      Recortar
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloneMultipleItems}
                      style={{ flex: 1, padding: '0.45rem', fontSize: '0.75rem', justifyContent: 'center', gap: '0.3rem' }}
                      title="Clonar seleção (Ctrl+D / ⌘D)"
                    >
                      <Copy size={14} />
                      Clonar Seleção
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => {
                        if (selectedItemId) {
                          handleDeleteItem(selectedItemId);
                        } else {
                          handleDeleteMultipleItems(selectedItemIds);
                        }
                      }}
                      style={{ flex: 1, padding: '0.45rem', fontSize: '0.75rem', justifyContent: 'center', gap: '0.3rem' }}
                    >
                      <Trash2 size={14} />
                      Remover Seleção
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Multi-selection wall grouping actions */}
            {selectedWallIds.length > 1 && (
              <div className="panel-section" style={{ backgroundColor: 'rgba(99, 102, 241, 0.05)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.15)', marginBottom: '1rem' }}>
                <span className="section-title" style={{ color: 'var(--color-primary)' }}>Ações de Seleção de Paredes</span>
                <p style={{ fontSize: '0.75rem', margin: '0.25rem 0 0.75rem 0', color: 'var(--text-primary)' }}>
                  <strong>{selectedWallIds.length}</strong> paredes selecionadas.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {!areSelectedWallsGrouped() ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleGroupSelectedWalls}
                      style={{ width: '100%', padding: '0.45rem', fontSize: '0.75rem', justifyContent: 'center' }}
                    >
                      Agrupar Paredes (Mover Juntas)
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleUngroupSelectedWalls}
                      style={{ width: '100%', padding: '0.45rem', fontSize: '0.75rem', justifyContent: 'center', color: 'var(--color-danger)' }}
                    >
                      Desagrupar Paredes
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleDeleteMultipleWalls(selectedWallIds)}
                    style={{ width: '100%', padding: '0.45rem', fontSize: '0.75rem', justifyContent: 'center' }}
                  >
                    Excluir Paredes Selecionadas
                  </button>
                </div>
              </div>
            )}


            {selectedItemIds.length <= 1 && selectedItem && (
              <div className="panel-section">
                <span className="section-title">
                  {selectedItem.type === 'text' ? 'Anotação de Texto' : 'Propriedades do Móvel'}
                </span>
                
                {/* Input Text Content */}
                <div className="form-group">
                  <label>{selectedItem.type === 'text' ? 'Texto Exibido' : 'Nome do Item'}</label>
                  <input
                    type="text"
                    value={localNameText}
                    onFocus={() => setFocusedInput('name')}
                    onChange={(e) => {
                      setLocalNameText(e.target.value);
                      handleUpdateItem(selectedItem.id, { name: e.target.value });
                    }}
                    onBlur={() => {
                      setFocusedInput(null);
                      const trimmed = localNameText.trim() || (selectedItem.type === 'text' ? 'Texto' : 'Móvel');
                      setLocalNameText(trimmed);
                      handleUpdateItem(selectedItem.id, { name: trimmed });
                    }}
                    className="input-styled"
                  />
                </div>

                {/* Font Size control (visible only for text item type) */}
                {selectedItem.type === 'text' && (
                  <div className="form-group">
                    <label>Tamanho da Fonte (px)</label>
                    <input
                      type="number"
                      value={localTextFontSize}
                      onFocus={() => setFocusedInput('fontSize')}
                      onChange={(e) => {
                        setLocalTextFontSize(e.target.value);
                        const parsed = parseInt(e.target.value);
                        if (!isNaN(parsed) && parsed > 4) {
                          handleUpdateItem(selectedItem.id, { fontSize: parsed });
                        }
                      }}
                      onBlur={() => {
                        setFocusedInput(null);
                        const parsed = Math.max(6, Math.min(200, parseInt(localTextFontSize) || 16));
                        setLocalTextFontSize(parsed.toString());
                        handleUpdateItem(selectedItem.id, { fontSize: parsed });
                      }}
                      className="input-styled"
                      min="6"
                      max="200"
                    />
                  </div>
                )}

                {/* Furniture Width/Depth measurements (hidden for text annotations) */}
                {selectedItem.type !== 'text' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Largura (cm)</label>
                      <input
                        type="number"
                        value={localWidthText}
                        onFocus={() => setFocusedInput('width')}
                        onChange={(e) => {
                          setLocalWidthText(e.target.value);
                          const parsed = parseInt(e.target.value);
                          if (!isNaN(parsed) && parsed > 0) {
                            handleUpdateItem(selectedItem.id, { width: parsed });
                          }
                        }}
                        onBlur={() => {
                          setFocusedInput(null);
                          const parsed = Math.max(10, Math.min(2000, parseInt(localWidthText) || 50));
                          setLocalWidthText(parsed.toString());
                          handleUpdateItem(selectedItem.id, { width: parsed });
                        }}
                        className="input-styled"
                        min="10"
                        max="2000"
                      />
                    </div>
                    <div className="form-group">
                      <label>Profundidade (cm)</label>
                      <input
                        type="number"
                        value={localDepthText}
                        onFocus={() => setFocusedInput('depth')}
                        onChange={(e) => {
                          setLocalDepthText(e.target.value);
                          const parsed = parseInt(e.target.value);
                          if (!isNaN(parsed) && parsed > 0) {
                            handleUpdateItem(selectedItem.id, { depth: parsed });
                          }
                        }}
                        onBlur={() => {
                          setFocusedInput(null);
                          const parsed = Math.max(10, Math.min(2000, parseInt(localDepthText) || 50));
                          setLocalDepthText(parsed.toString());
                          handleUpdateItem(selectedItem.id, { depth: parsed });
                        }}
                        className="input-styled"
                        min="10"
                        max="2000"
                      />
                    </div>
                  </div>
                )}

                {/* Precision Rotation input */}
                <div className="form-group">
                  <label>Rotação (graus: {selectedItem.rotation}°)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="range"
                      min="0"
                      max="359"
                      value={selectedItem.rotation}
                      onChange={(e) => {
                        const deg = parseInt(e.target.value) || 0;
                        setLocalRotationText(deg.toString());
                        handleUpdateItem(selectedItem.id, { rotation: deg });
                      }}
                      style={{ flex: 1, accentColor: 'var(--color-primary)' }}
                    />
                    <button
                      className="btn"
                      style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }}
                      onClick={() => {
                        const newRot = (selectedItem.rotation + 90) % 360;
                        setLocalRotationText(newRot.toString());
                        handleUpdateItem(selectedItem.id, { rotation: newRot });
                      }}
                      title="Rotacionar 90 graus"
                    >
                      <RotateCw size={12} />
                      +90°
                    </button>
                  </div>
                  <input
                    type="number"
                    value={localRotationText}
                    onFocus={() => setFocusedInput('rotation')}
                    onChange={(e) => {
                      setLocalRotationText(e.target.value);
                      const parsed = parseInt(e.target.value);
                      if (!isNaN(parsed)) {
                        handleUpdateItem(selectedItem.id, { rotation: parsed % 360 });
                      }
                    }}
                    onBlur={() => {
                      setFocusedInput(null);
                      let parsed = parseInt(localRotationText) || 0;
                      parsed = ((parsed % 360) + 360) % 360;
                      setLocalRotationText(parsed.toString());
                      handleUpdateItem(selectedItem.id, { rotation: parsed });
                    }}
                    className="input-styled"
                    style={{ marginTop: '0.25rem' }}
                    min="0"
                    max="360"
                  />
                 </div>

                {/* Flip control options (hidden for text) */}
                {selectedItem.type !== 'text' && (
                  <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Espelhamento (Flip)</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <button
                        type="button"
                        className={`btn ${selectedItem.flipX ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => handleUpdateItem(selectedItem.id, { flipX: !selectedItem.flipX })}
                        style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', justifyContent: 'center' }}
                      >
                        {selectedItem.flipX ? '✓ Espelhado X' : 'Espelhar X'}
                      </button>
                      <button
                        type="button"
                        className={`btn ${selectedItem.flipY ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => handleUpdateItem(selectedItem.id, { flipY: !selectedItem.flipY })}
                        style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', justifyContent: 'center' }}
                      >
                        {selectedItem.flipY ? '✓ Espelhado Y' : 'Espelhar Y'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Color swatches selector */}
                <div className="form-group">
                  <label>{selectedItem.type === 'text' ? 'Cor do Texto' : 'Cor de Destaque'}</label>
                  <div className="color-swatches">
                    {['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#ef4444', '#cbd5e1', '#ffffff', '#94a3b8'].map(colorHex => (
                      <button
                        key={colorHex}
                        className={`color-swatch ${selectedItem.color === colorHex ? 'active' : ''}`}
                        style={{ backgroundColor: colorHex }}
                        onClick={() => handleUpdateItem(selectedItem.id, { color: colorHex })}
                      />
                    ))}
                  </div>
                </div>

                {selectedItem.groupId && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleUngroupItem(selectedItem.id)}
                    style={{ marginTop: '0.75rem', width: '100%', color: 'var(--color-danger)' }}
                  >
                    Desagrupar Objeto (Mover Sozinho)
                  </button>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCopyItems}
                    style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', justifyContent: 'center', gap: '0.35rem' }}
                    title="Copiar objeto (Ctrl+C / ⌘C)"
                  >
                    <Copy size={14} />
                    Copiar
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCutItems}
                    style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', justifyContent: 'center', gap: '0.35rem' }}
                    title="Recortar objeto (Ctrl+X / ⌘X)"
                  >
                    <Scissors size={14} />
                    Recortar
                  </button>
                  {clipboard.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handlePasteItems}
                      style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', justifyContent: 'center', gap: '0.35rem' }}
                      title="Colar objeto (Ctrl+V / ⌘V)"
                    >
                      <Clipboard size={14} />
                      Colar
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleCloneItem(selectedItem.id)}
                    style={{ flex: 1, justifyContent: 'center', gap: '0.4rem' }}
                    title="Clonar item (Ctrl+D / ⌘D)"
                  >
                    <Copy size={16} />
                    Clonar
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleDeleteItem(selectedItem.id)}
                    style={{ flex: 1, justifyContent: 'center', gap: '0.4rem' }}
                    title="Remover item (Delete / Backspace)"
                  >
                    <Trash2 size={16} />
                    Remover
                  </button>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleOpenSaveCustomPresetModal(selectedItem)}
                  style={{ marginTop: '0.75rem', width: '100%', justifyContent: 'center', gap: '0.4rem', borderColor: 'rgba(99, 102, 241, 0.4)' }}
                >
                  <SaveAll size={16} />
                  Salvar nos Modelos
                </button>
              </div>
            )}

            {selectedWall && (
              <div className="panel-section">
                <span className="section-title">Propriedades da Parede</span>
                
                {/* Wall Length dimension input */}
                <div className="form-group">
                  <label>Comprimento da Parede (metros)</label>
                  <input
                    type="number"
                    value={localLengthText}
                    onFocus={() => setFocusedInput('length')}
                    onChange={(e) => {
                      setLocalLengthText(e.target.value);
                      const parsedM = parseFloat(e.target.value);
                      if (!isNaN(parsedM) && parsedM > 0) {
                        const parsedCm = parsedM * 100;
                        const dx = selectedWall!.x2 - selectedWall!.x1;
                        const dy = selectedWall!.y2 - selectedWall!.y1;
                        const len = Math.hypot(dx, dy);
                        if (len > 0) {
                          const ux = dx / len;
                          const uy = dy / len;
                          const nextX2 = selectedWall!.x1 + ux * parsedCm;
                          const nextY2 = selectedWall!.y1 + uy * parsedCm;
                          handleUpdateWall(selectedWall!.id, { x2: Math.round(nextX2), y2: Math.round(nextY2) });
                        }
                      }
                    }}
                    onBlur={() => {
                      setFocusedInput(null);
                      const parsedM = parseFloat(localLengthText) || 1.0;
                      const boundedM = Math.max(0.1, Math.min(100, parsedM));
                      const parsedCm = boundedM * 100;
                      const dx = selectedWall!.x2 - selectedWall!.x1;
                      const dy = selectedWall!.y2 - selectedWall!.y1;
                      const len = Math.hypot(dx, dy);
                      if (len > 0) {
                        const ux = dx / len;
                        const uy = dy / len;
                        const nextX2 = selectedWall!.x1 + ux * parsedCm;
                        const nextY2 = selectedWall!.y1 + uy * parsedCm;
                        setLocalLengthText(boundedM.toFixed(2));
                        handleUpdateWall(selectedWall!.id, { x2: Math.round(nextX2), y2: Math.round(nextY2) });
                      }
                    }}
                    className="input-styled"
                    step="0.01"
                    min="0.1"
                  />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    Ao alterar o comprimento, a extremidade final será estendida ou encolhida.
                  </span>
                </div>

                {/* Wall thickness properties */}
                <div className="form-group">
                  <label>Espessura da Parede (cm)</label>
                  <input
                    type="number"
                    value={localThicknessText}
                    onFocus={() => setFocusedInput('thickness')}
                    onChange={(e) => {
                      setLocalThicknessText(e.target.value);
                      const parsed = parseInt(e.target.value);
                      if (!isNaN(parsed) && parsed > 0) {
                        handleUpdateWall(selectedWall.id, { thickness: parsed });
                      }
                    }}
                    onBlur={() => {
                      setFocusedInput(null);
                      const parsed = Math.max(5, Math.min(100, parseInt(localThicknessText) || 15));
                      setLocalThicknessText(parsed.toString());
                      handleUpdateWall(selectedWall.id, { thickness: parsed });
                    }}
                    className="input-styled"
                    min="5"
                    max="100"
                  />
                </div>

                {/* Wall Angle properties */}
                <div className="form-group">
                  <label>Ângulo de Rotação (graus: {localWallAngleText}°)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="range"
                      min="0"
                      max="359"
                      value={parseInt(localWallAngleText) || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setLocalWallAngleText(val.toString());
                        
                        const dx = selectedWall!.x2 - selectedWall!.x1;
                        const dy = selectedWall!.y2 - selectedWall!.y1;
                        const length = Math.hypot(dx, dy);
                        const rad = (val * Math.PI) / 180;
                        const nextX2 = selectedWall!.x1 + Math.cos(rad) * length;
                        const nextY2 = selectedWall!.y1 + Math.sin(rad) * length;
                        handleUpdateWall(selectedWall!.id, { x2: Math.round(nextX2), y2: Math.round(nextY2) });
                      }}
                      style={{ flex: 1, accentColor: 'var(--color-primary)' }}
                    />
                  </div>
                  <input
                    type="number"
                    value={localWallAngleText}
                    onFocus={() => setFocusedInput('wallAngle')}
                    onChange={(e) => {
                      setLocalWallAngleText(e.target.value);
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) {
                        const dx = selectedWall!.x2 - selectedWall!.x1;
                        const dy = selectedWall!.y2 - selectedWall!.y1;
                        const length = Math.hypot(dx, dy);
                        const rad = ((val % 360) * Math.PI) / 180;
                        const nextX2 = selectedWall!.x1 + Math.cos(rad) * length;
                        const nextY2 = selectedWall!.y1 + Math.sin(rad) * length;
                        handleUpdateWall(selectedWall!.id, { x2: Math.round(nextX2), y2: Math.round(nextY2) });
                      }
                    }}
                    onBlur={() => {
                      setFocusedInput(null);
                      let val = parseInt(localWallAngleText) || 0;
                      val = ((val % 360) + 360) % 360;
                      setLocalWallAngleText(val.toString());
                      
                      const dx = selectedWall!.x2 - selectedWall!.x1;
                      const dy = selectedWall!.y2 - selectedWall!.y1;
                      const length = Math.hypot(dx, dy);
                      const rad = (val * Math.PI) / 180;
                      const nextX2 = selectedWall!.x1 + Math.cos(rad) * length;
                      const nextY2 = selectedWall!.y1 + Math.sin(rad) * length;
                      handleUpdateWall(selectedWall!.id, { x2: Math.round(nextX2), y2: Math.round(nextY2) });
                    }}
                    className="input-styled"
                    min="0"
                    max="360"
                  />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    Ao alterar o ângulo, a parede irá rotacionar em torno do seu ponto inicial.
                  </span>
                </div>

                {/* Wall Curvature offset properties */}
                <div className="form-group">
                  <label>Curvatura da Parede (cm: {selectedWall.curve || 0}cm)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <input
                      type="range"
                      min="-200"
                      max="200"
                      value={selectedWall.curve || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        handleUpdateWall(selectedWall.id, { curve: val });
                      }}
                      style={{ accentColor: 'var(--color-warning)' }}
                    />
                    <button
                      className="btn"
                      style={{ padding: '0.2rem', fontSize: '0.7rem' }}
                      onClick={() => handleUpdateWall(selectedWall.id, { curve: 0 })}
                      disabled={!selectedWall.curve || selectedWall.curve === 0}
                    >
                      Tornar Reta (Remover Curva)
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Ponto A: ({selectedWall.x1}, {selectedWall.y1}) cm</span>
                  <span>Ponto B: ({selectedWall.x2}, {selectedWall.y2}) cm</span>
                </div>

                {selectedWall.groupId && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleUngroupWall(selectedWall.id)}
                    style={{ marginTop: '0.75rem', width: '100%', color: 'var(--color-danger)', fontSize: '0.75rem', justifyContent: 'center' }}
                  >
                    Desagrupar Parede (Mover Sozinha)
                  </button>
                )}

                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteWall(selectedWall.id)}
                  style={{ marginTop: '1.25rem', width: '100%' }}
                >
                  <Trash2 size={16} />
                  Remover Parede
                </button>
              </div>
            )}

            {selectedItemIds.length === 0 && !selectedWall && (
              <div className="empty-inspector">
                <Info className="empty-inspector-icon" />
                <p>Nenhum item selecionado.</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Selecione um móvel, anotação de texto ou segmento de parede no canvas para alterar suas propriedades.
                </p>
                
                {clipboard.length > 0 && (
                  <div style={{ width: '100%', marginTop: '1.25rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1.25rem' }}>
                    <span className="section-title" style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '0.5rem' }}>Área de Transferência</span>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handlePasteItems}
                      style={{ width: '100%', fontSize: '0.75rem', justifyContent: 'center', gap: '0.4rem' }}
                      title="Colar itens copiados neste pavimento (Ctrl+V / ⌘V)"
                    >
                      <Clipboard size={14} />
                      Colar {clipboard.length} item(ns)
                    </button>
                  </div>
                )}
                
                <div className="danger-zone" style={{ width: '100%' }}>
                  <span className="section-title" style={{ color: 'var(--color-danger)' }}>Remover Tudo</span>
                  <button
                    className="btn btn-danger"
                    onClick={handleClearAll}
                    style={{ marginTop: '0.5rem', width: '100%' }}
                  >
                    <Trash2 size={16} />
                    Limpar Pavimento
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Add Floor Modal dialog */}
      {isAddFloorModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddFloorModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Adicionar Novo Pavimento</span>
              <button
                type="button"
                className="floor-tab-delete"
                onClick={() => setIsAddFloorModalOpen(false)}
                style={{ fontSize: '1.25rem' }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nome do Andar / Pavimento</label>
                <input
                  type="text"
                  value={newFloorNameInput}
                  onChange={(e) => setNewFloorNameInput(e.target.value)}
                  className="input-styled"
                  placeholder="ex: 1º Andar"
                  autoFocus
                />
              </div>

              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label>Copiar Paredes de Guia</label>
                <select
                  value={copyWallsFromFloorInput}
                  onChange={(e) => setCopyWallsFromFloorInput(e.target.value)}
                  className="input-styled"
                >
                  <option value="none">Não copiar (Começar andar vazio)</option>
                  {project.floors.map(f => (
                    <option key={f.id} value={f.id}>
                      Copiar paredes de: {f.name}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Isso irá copiar a planta de paredes do andar escolhido para facilitar o alinhamento das paredes superiores.
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn"
                onClick={() => setIsAddFloorModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddFloorConfirmed}
              >
                Adicionar Pavimento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generic Confirmation Modal */}
      {confirmActionModal && (
        <div className="modal-overlay" onClick={() => setConfirmActionModal(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{confirmActionModal.title}</span>
              <button
                type="button"
                className="floor-tab-delete"
                onClick={() => setConfirmActionModal(null)}
                style={{ fontSize: '1.25rem' }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                {confirmActionModal.message}
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn"
                onClick={() => setConfirmActionModal(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  confirmActionModal.onConfirm();
                  setConfirmActionModal(null);
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Projects Modal ─────────────────────────────────────────────── */}
      {isProjectsModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProjectsModalOpen(false)}>
          <div className="modal-panel projects-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="modal-title">Meus Projetos</span>
              <button className="btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => setIsProjectsModalOpen(false)}>✕ Fechar</button>
            </div>
            <div style={{ padding: '1rem', overflowY: 'auto', maxHeight: '420px' }}>
              {projectsLoading && (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 0' }}>Carregando projetos…</div>
              )}
              {!projectsLoading && savedProjects.length === 0 && (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📂</div>
                  Nenhum projeto salvo ainda.<br />
                  <span style={{ fontSize: '0.8rem' }}>Crie um projeto e clique em <strong>Salvar</strong>.</span>
                </div>
              )}
              {!projectsLoading && savedProjects.map(p => (
                <div
                  key={p.id}
                  onClick={() => handleLoadProject(p.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.75rem 1rem', marginBottom: '0.5rem',
                    background: p.id === projectId ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                    border: p.id === projectId ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px', cursor: 'pointer',
                    transition: 'background 0.15s, border-color 0.15s'
                  }}
                  onMouseEnter={e => { if (p.id !== projectId) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
                  onMouseLeave={e => { if (p.id !== projectId) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                >
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#e2e8f0' }}>
                      {p.id === projectId && <span style={{ color: '#818cf8', marginRight: '6px' }}>▶</span>}
                      {p.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                      Salvo em: {new Date(p.updated_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                    onClick={e => handleDeleteSavedProject(p.id, e)}
                    title="Excluir projeto"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Save As Modal ──────────────────────────────────────────────── */}
      {isSaveAsModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSaveAsModalOpen(false)}>
          <div className="modal-panel" style={{ width: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Salvar como…</span>
            </div>
            <form
              className="modal-body"
              onSubmit={e => { e.preventDefault(); if (saveAsNameInput.trim()) handleSaveAs(saveAsNameInput.trim()); }}
            >
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                  Nome do novo projeto
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={saveAsNameInput}
                  onChange={e => setSaveAsNameInput(e.target.value)}
                  placeholder="Ex: Planta Residência — v2"
                  autoFocus
                  style={{ width: '100%' }}
                />
              </div>
              <div className="modal-footer" style={{ padding: 0, paddingTop: '0.75rem' }}>
                <button type="button" className="btn" onClick={() => setIsSaveAsModalOpen(false)}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!saveAsNameInput.trim()}
                  style={{ fontWeight: '600' }}
                >
                  <SaveAll size={15} />
                  Salvar como novo projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Save Custom Preset Modal ────────────────────────────────────── */}
      {isSavePresetModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSavePresetModalOpen(false)}>
          <div className="modal-panel" style={{ width: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Salvar nos Modelos Personalizados</span>
            </div>
            <form
              className="modal-body"
              onSubmit={e => { e.preventDefault(); handleConfirmSaveCustomPreset(); }}
            >
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                  Nome do Modelo
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={savePresetName}
                  onChange={e => setSavePresetName(e.target.value)}
                  placeholder="Ex: Sofá Especial"
                  autoFocus
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                  Disponibilidade (Salvar Em)
                </label>
                <select
                  value={savePresetScope}
                  onChange={e => setSavePresetScope(e.target.value as 'project' | 'global')}
                  className="input-styled"
                  style={{ width: '100%', padding: '0.5rem' }}
                >
                  <option value="project">Apenas neste projeto</option>
                  <option value="global">Todos os meus projetos (Memória Global)</option>
                </select>
              </div>

              <div className="modal-footer" style={{ padding: 0, paddingTop: '0.75rem' }}>
                <button type="button" className="btn" onClick={() => setIsSavePresetModalOpen(false)}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!savePresetName.trim()}
                  style={{ fontWeight: '600' }}
                >
                  <SaveAll size={15} />
                  Salvar nos Modelos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Print Settings Modal ────────────────────────────────────── */}
      {isPrintModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPrintModalOpen(false)}>
          <div className="modal-panel" style={{ width: 460 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Printer size={18} style={{ color: 'var(--color-primary)' }} />
                Opções de Impressão
              </span>
            </div>
            <div className="modal-body">
              {/* 1. Select floors */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.40rem', display: 'block' }}>
                  Pavimentos a Imprimir
                </label>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    <input
                      type="radio"
                      name="printFloors"
                      checked={printFloorsOption === 'all'}
                      onChange={() => setPrintFloorsOption('all')}
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    Todos os pavimentos
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    <input
                      type="radio"
                      name="printFloors"
                      checked={printFloorsOption === 'specific'}
                      onChange={() => setPrintFloorsOption('specific')}
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    Pavimentos específicos
                  </label>
                </div>

                {printFloorsOption === 'specific' && (
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.5rem 0.75rem',
                    maxHeight: '120px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    marginTop: '0.5rem'
                  }}>
                    {project.floors.map(floor => (
                      <label key={floor.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                        <input
                          type="checkbox"
                          checked={printSelectedFloorIds.includes(floor.id)}
                          style={{ accentColor: 'var(--color-primary)' }}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPrintSelectedFloorIds([...printSelectedFloorIds, floor.id]);
                            } else {
                              setPrintSelectedFloorIds(printSelectedFloorIds.filter(id => id !== floor.id));
                            }
                          }}
                        />
                        {floor.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Select versions (Antes / Depois / Ambos) */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.40rem', display: 'block' }}>
                  Versões a Imprimir
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    <input
                      type="radio"
                      name="printLayouts"
                      checked={printLayoutsOption === 'before'}
                      onChange={() => setPrintLayoutsOption('before')}
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    Layout Atual (Antes)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    <input
                      type="radio"
                      name="printLayouts"
                      checked={printLayoutsOption === 'after'}
                      onChange={() => setPrintLayoutsOption('after')}
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    Layout Proposto (Depois)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    <input
                      type="radio"
                      name="printLayouts"
                      checked={printLayoutsOption === 'both'}
                      onChange={() => setPrintLayoutsOption('both')}
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    Ambos (Antes e Depois)
                  </label>
                </div>
              </div>

              {/* 3. Both layout order settings */}
              {printLayoutsOption === 'both' && (
                <div className="form-group" style={{
                  marginBottom: '1rem',
                  backgroundColor: 'rgba(99, 102, 241, 0.03)',
                  border: '1px dashed rgba(99, 102, 241, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem'
                }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-primary)', marginBottom: '0.35rem', display: 'block' }}>
                    Organização no Papel (Ambos)
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                      <input
                        type="radio"
                        name="printBothOrder"
                        checked={printBothOrder === 'sequence'}
                        onChange={() => setPrintBothOrder('sequence')}
                        style={{ accentColor: 'var(--color-primary)' }}
                      />
                      Na mesma página (um após o outro por andar)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                      <input
                        type="radio"
                        name="printBothOrder"
                        checked={printBothOrder === 'grouped'}
                        onChange={() => setPrintBothOrder('grouped')}
                        style={{ accentColor: 'var(--color-primary)' }}
                      />
                      Páginas separadas (primeiro todos os Antes, depois todos os Depois)
                    </label>
                  </div>
                </div>
              )}

              <div className="modal-footer" style={{ padding: 0, paddingTop: '0.75rem' }}>
                <button type="button" className="btn" onClick={() => setIsPrintModalOpen(false)}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={printFloorsOption === 'specific' && printSelectedFloorIds.length === 0}
                  onClick={() => {
                    setIsPrintModalOpen(false);
                    setTimeout(() => {
                      window.print();
                    }, 250);
                  }}
                  style={{ fontWeight: '600' }}
                >
                  <Printer size={15} />
                  Confirmar e Imprimir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Off-screen Print Container */}
      <div className="print-layout-container">
        <div className="print-header-brand">
          <h2>{project.name}</h2>
          <span>Estúdio de Layout de Planta Baixa</span>
        </div>
        {getPrintPages().map((page, pageIdx) => (
          <div key={pageIdx} className="print-page-break">
            <h3 className="print-page-title">{page.title}</h3>
            <div className="print-layouts-wrapper">
              {page.layouts.map((l, lIdx) => (
                <div key={lIdx} className="print-single-layout">
                  {page.layouts.length > 1 && <h4 className="print-layout-subtitle">{l.subtitle}</h4>}
                  <div className="print-svg-wrapper">
                    {renderPrintSvg(l.layout)}
                  </div>
                </div>
              ))}
            </div>
            <div className="print-page-footer">
              <span>Página {pageIdx + 1} de {getPrintPages().length}</span>
              <span>Gerado em {new Date().toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
