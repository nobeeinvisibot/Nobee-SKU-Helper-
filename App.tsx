/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { Layout, Box, Image as ImageIcon, Wand2, Layers, Plus, Trash2, Download, History, Sparkles, Shirt, Move, Maximize, RotateCcw, Zap, Cpu, ArrowRight, Globe, Scan, Camera, Aperture, Repeat, SprayCan, Triangle, Package, Menu, X, Check, MousePointer2, Languages } from 'lucide-react';
import { Button } from './components/Button';
import { FileUploader } from './components/FileUploader';
import { generateMockup, generateAsset, generateRealtimeComposite } from './services/geminiService';
import { Asset, GeneratedMockup, AppView, LoadingState, PlacedLayer } from './types';
import { useApiKey } from './hooks/useApiKey';
import ApiKeyDialog from './components/ApiKeyDialog';

// --- Translations ---

const TRANSLATIONS = {
  en: {
    appTitle: "Nobee SKU graphic helper",
    dashboard: "Dashboard",
    assets: "Assets",
    studio: "Studio",
    gallery: "Gallery",
    documentation: "Documentation",
    credits: "Credits",
    startCreating: "Start Creating",
    uploadAssets: "Upload Assets",
    designMockup: "Design Mockup",
    downloadResult: "Download Result",
    products: "Products",
    logosGraphics: "Logos & Graphics",
    upload: "Upload",
    generateAi: "Generate with AI",
    generate: "Generate",
    selectProduct: "Select Product",
    addLogos: "Add Logos",
    instructions: "Instructions",
    generateMockup: "Generate Mockup",
    generatedMockups: "Generated Mockups",
    newMockup: "New Mockup",
    view: "View",
    save: "Save",
    download: "Download",
    items: "items",
    noItems: "No items yet",
    dragDrop: "Drag & drop or click",
    dashboardTitle: "Create Realistic Merchandise Mockups",
    dashboardSubtitle: "Upload your logos and products, and let our AI composite them perfectly with realistic lighting, shadows, and warping.",
    featAsset: "Asset Management",
    featAssetDesc: "Organize logos and product bases.",
    featCompositing: "AI Compositing",
    featCompositingDesc: "Smart blending and surface mapping.",
    featExport: "High-Res Export",
    featExportDesc: "Production-ready visuals.",
    footerText: "By using this app, you confirm that you have the necessary rights to any content that you upload. Do not generate content that infringes on others’ intellectual property or privacy rights. Your use of this generative AI service is subject to our Prohibited Use Policy.\nPlease note that uploads from Google Workspace may be used to develop and improve Google products and services in accordance with our terms.",
    step1: "Select Product",
    step2: "Add Logos",
    step3: "Instructions",
    instrPlaceholder: "E.g. Embed the logos into the fabric texture...",
    noProducts: "No products uploaded",
    noLogos: "No logos uploaded",
    onCanvas: "on canvas",
    selectProductToStart: "Select a product to start designing",
    loadingAnalysis: "Analyzing composite geometry...",
    mobileFooter: "Nobee SKU graphic helper Mobile v1.0",
    creditsCount: "Credits: ∞",
    noMockups: "No mockups yet",
    createFirst: "Create your first design in the Studio",
    goToStudio: "Go to Studio",
    clickToAdd: "Click to add. Drag on canvas to move. Scroll to resize.",
    describePrompt: "Describe the {0} you want to create...",
    generateBtn: "Generate {0}",
    noAssetType: "No {0}s yet",
    continueToStudio: "Continue to Studio",
    uploadType: "Upload {0}",
    clickToAddLogo: "Click to add. Drag on canvas to move. Scroll to resize.",
    product: "Product",
    logo: "Logo"
  },
  zh: {
    appTitle: "Nobee SKU 圖形助手",
    dashboard: "儀表板",
    assets: "素材",
    studio: "工作室",
    gallery: "圖庫",
    documentation: "文檔",
    credits: "點數",
    startCreating: "開始創作",
    uploadAssets: "上傳素材",
    designMockup: "設計樣機",
    downloadResult: "下載結果",
    products: "產品",
    logosGraphics: "Logo 與圖形",
    upload: "上傳",
    generateAi: "AI 生成",
    generate: "生成",
    selectProduct: "選擇產品",
    addLogos: "添加 Logo",
    instructions: "指令",
    generateMockup: "生成樣機",
    generatedMockups: "已生成樣機",
    newMockup: "新樣機",
    view: "查看",
    save: "儲存",
    download: "下載",
    items: "項目",
    noItems: "尚無項目",
    dragDrop: "拖放或點擊",
    dashboardTitle: "創建逼真的商品樣機",
    dashboardSubtitle: "上傳您的 Logo 和產品，讓我們的 AI 以逼真的光影和變形效果完美合成。",
    featAsset: "素材管理",
    featAssetDesc: "組織 Logo 和產品底圖。",
    featCompositing: "AI 合成",
    featCompositingDesc: "智能混合與表面映射。",
    featExport: "高解析度導出",
    featExportDesc: "生產級視覺效果。",
    footerText: "使用此應用即表示您確認擁有上傳內容的必要權利。請勿生成侵犯他人知識產權或隱私權的內容。您使用此生成式 AI 服務受我們的禁止使用政策約束。\n請注意，根據我們的條款，來自 Google Workspace 的上傳內容可能會用於開發和改進 Google 產品和服務。",
    step1: "選擇產品",
    step2: "添加 Logo",
    step3: "指令",
    instrPlaceholder: "例如：將 Logo 嵌入布料紋理中...",
    noProducts: "未上傳產品",
    noLogos: "未上傳 Logo",
    onCanvas: "在畫布上",
    selectProductToStart: "選擇一個產品開始設計",
    loadingAnalysis: "正在分析合成幾何結構...",
    mobileFooter: "Nobee SKU 圖形助手 行動版 v1.0",
    creditsCount: "點數：∞",
    noMockups: "尚無樣機",
    createFirst: "在工作室創建您的第一個設計",
    goToStudio: "前往工作室",
    clickToAdd: "點擊添加。在畫布上拖動移動。滾動縮放。",
    describePrompt: "描述您想要創建的 {0}...",
    generateBtn: "生成 {0}",
    noAssetType: "尚無 {0}",
    continueToStudio: "繼續前往工作室",
    uploadType: "上傳 {0}",
    clickToAddLogo: "點擊添加。在畫布上拖曳移動。滾動縮放。",
    product: "產品",
    logo: "Logo"
  }
};

type Lang = 'en' | 'zh';

// --- Brand Components ---

const NobeeLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Gear Shape */}
    <circle cx="50" cy="50" r="44" stroke="#EAB308" strokeWidth="12" strokeDasharray="20 11.4" strokeDashoffset="0" strokeLinecap="round" />
    <circle cx="50" cy="50" r="39" fill="#FACC15" />
    
    {/* Ears */}
    <circle cx="28" cy="28" r="9" fill="#FEF08A" />
    <circle cx="72" cy="28" r="9" fill="#FEF08A" />
    <circle cx="28" cy="28" r="4" fill="#FFFFFF" fillOpacity="0.8" />
    <circle cx="72" cy="28" r="4" fill="#FFFFFF" fillOpacity="0.8" />
    
    {/* Face Screen */}
    <rect x="24" y="34" width="52" height="38" rx="14" fill="#18181b" />
    
    {/* Eyes */}
    <ellipse cx="38" cy="52" rx="7" ry="10" fill="white" />
    <ellipse cx="62" cy="52" rx="7" ry="10" fill="white" />
  </svg>
);

// --- Intro Component ---

const IntroSequence = ({ lang }: { lang: Lang }) => {
  const t = TRANSLATIONS[lang];
  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center animate-[fadeOut_0.5s_ease-in_2.5s_forwards]">
      <div className="relative animate-[spinAppear_0.8s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">
         <NobeeLogo className="w-32 h-32 md:w-48 md:h-48 drop-shadow-2xl" />
      </div>
      
      <div className="mt-8 text-center animate-[slideUp_0.8s_ease-out_0.3s_both]">
         <h1 className="text-2xl md:text-4xl font-black text-zinc-900 tracking-tight">
            {t.appTitle}
         </h1>
      </div>
    </div>
  );
};

// --- UI Components ---

const NavButton = ({ icon, label, active, onClick, number }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, number?: number }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group
      ${active ? 'bg-[#eac415]/10 text-zinc-900 border-l-2 border-[#eac415]' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`}
  >
    <span className={`${active ? 'text-[#ab6b00]' : 'text-zinc-400 group-hover:text-zinc-600'} transition-colors`}>
      {icon}
    </span>
    <span className="font-medium text-sm tracking-wide flex-1 text-left">{label}</span>
    {number && (
      <span className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded min-w-[1.5rem] text-center transition-colors ${active ? 'bg-[#eac415] text-black' : 'bg-zinc-200 text-zinc-500'}`}>
        {number}
      </span>
    )}
  </button>
);

const WorkflowStepper = ({ currentView, onViewChange, lang }: { currentView: AppView, onViewChange: (view: AppView) => void, lang: Lang }) => {
  const t = TRANSLATIONS[lang];
  const steps = [
    { id: 'assets', label: t.uploadAssets, number: 1 },
    { id: 'studio', label: t.designMockup, number: 2 },
    { id: 'gallery', label: t.downloadResult, number: 3 },
  ];

  const viewOrder = ['assets', 'studio', 'gallery'];
  const currentIndex = viewOrder.indexOf(currentView);
  const progress = Math.max(0, (currentIndex / (steps.length - 1)) * 100);

  return (
    <div className="w-full max-w-2xl mx-auto mb-12 hidden md:block animate-fade-in px-4">
      <div className="relative">
         {/* Background Track */}
         <div className="absolute top-1/2 left-0 right-0 h-1 bg-zinc-200 -translate-y-1/2 rounded-full"></div>
         
         {/* Active Progress Bar */}
         <div 
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-[#eac415] to-[#ab6b00] -translate-y-1/2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
         ></div>

         <div className="relative flex justify-between w-full">
            {steps.map((step, index) => {
               const isCompleted = currentIndex > index;
               const isCurrent = currentIndex === index;
               
               return (
                  <button 
                    key={step.id}
                    onClick={() => onViewChange(step.id as AppView)}
                    className={`group flex flex-col items-center focus:outline-none relative z-10 cursor-pointer`}
                  >
                     <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center border-[3px] transition-all duration-300 bg-white
                        ${isCurrent 
                           ? 'border-[#eac415] text-zinc-900 shadow-[0_0_20px_rgba(234,196,21,0.5)] scale-110' 
                           : isCompleted 
                              ? 'border-[#eac415] bg-[#eac415] text-black' 
                              : 'border-zinc-200 text-zinc-400 group-hover:border-zinc-300 group-hover:text-zinc-600'}
                     `}>
                        {isCompleted ? (
                           <Check size={18} strokeWidth={3} />
                        ) : (
                           <span className="text-sm font-bold font-mono">{step.number}</span>
                        )}
                     </div>
                     <span className={`
                        absolute top-14 text-xs font-medium tracking-wider transition-all duration-300 whitespace-nowrap
                        ${isCurrent ? 'text-[#ab6b00] opacity-100 transform translate-y-0' : isCompleted ? 'text-zinc-500 opacity-80' : 'text-zinc-400 opacity-60 group-hover:opacity-100'}
                     `}>
                        {step.label}
                     </span>
                  </button>
               )
            })}
         </div>
      </div>
    </div>
  )
};

// Helper component for Asset Sections
const AssetSection = ({ 
  title, 
  icon, 
  type, 
  assets, 
  onAdd, 
  onRemove,
  validateApiKey,
  onApiError,
  lang
}: { 
  title: string, 
  icon: React.ReactNode, 
  type: 'logo' | 'product', 
  assets: Asset[], 
  onAdd: (a: Asset) => void, 
  onRemove: (id: string) => void,
  validateApiKey: () => Promise<boolean>,
  onApiError: (e: any) => void,
  lang: Lang
}) => {
  const [mode, setMode] = useState<'upload' | 'generate'>('upload');
  const [genPrompt, setGenPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const t = TRANSLATIONS[lang];

  const typeLabel = type === 'product' ? t.product : t.logo;

  const handleGenerate = async () => {
    if (!genPrompt) return;
    
    // Validate API key first
    if (!(await validateApiKey())) return;

    setIsGenerating(true);
    try {
      const b64 = await generateAsset(genPrompt, type);
      onAdd({
        id: Math.random().toString(36).substring(7),
        type,
        name: `AI Generated ${type}`,
        data: b64,
        mimeType: 'image/png'
      });
      setGenPrompt('');
    } catch (e: any) {
      console.error(e);
      onApiError(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl h-full flex flex-col bg-white border border-zinc-200">
      <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900">{icon} {title}</h2>
          <span className="text-xs bg-zinc-100 px-2 py-1 rounded text-zinc-500 border border-zinc-200">{assets.length} {t.items}</span>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 overflow-y-auto max-h-[400px] pr-2">
          {assets.map(asset => (
            <div key={asset.id} className="relative group aspect-square bg-zinc-50 rounded-lg overflow-hidden border border-zinc-200">
                <img src={asset.data} className="w-full h-full object-contain p-2" alt={asset.name} />
                <button onClick={() => onRemove(asset.id)} className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={12} />
                </button>
            </div>
          ))}
          {assets.length === 0 && (
            <div className="col-span-2 sm:col-span-3 flex flex-col items-center justify-center h-32 text-zinc-400 border border-dashed border-zinc-200 rounded-lg">
              <p className="text-sm">{t.noAssetType.replace('{0}', typeLabel)}</p>
            </div>
          )}
      </div>

      {/* Creation Area */}
      <div className="mt-auto pt-4 border-t border-zinc-100">
        <div className="flex gap-4 mb-4">
           <button 
             onClick={() => setMode('upload')}
             className={`text-sm font-medium pb-1 border-b-2 transition-colors ${mode === 'upload' ? 'border-[#eac415] text-[#ab6b00]' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
           >
             {t.upload}
           </button>
           <button 
             onClick={() => setMode('generate')}
             className={`text-sm font-medium pb-1 border-b-2 transition-colors ${mode === 'generate' ? 'border-[#eac415] text-[#ab6b00]' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
           >
             {t.generateAi}
           </button>
        </div>

        {mode === 'upload' ? (
           <FileUploader label={t.uploadType.replace('{0}', typeLabel)} onFileSelect={(f) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                onAdd({
                  id: Math.random().toString(36).substring(7),
                  type,
                  name: f.name,
                  data: e.target?.result as string,
                  mimeType: f.type
                });
              };
              reader.readAsDataURL(f);
           }} text={{ dragDrop: t.dragDrop }} />
        ) : (
           <div className="space-y-3">
              <textarea 
                value={genPrompt}
                onChange={(e) => setGenPrompt(e.target.value)}
                placeholder={t.describePrompt.replace('{0}', typeLabel)}
                className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-3 text-base text-zinc-900 focus:ring-2 focus:ring-[#eac415] resize-none h-24 placeholder:text-zinc-400 focus:border-[#eac415] focus:outline-none"
              />
              <Button 
                onClick={handleGenerate} 
                isLoading={isGenerating} 
                disabled={!genPrompt}
                className="w-full"
                icon={<Sparkles size={16} />}
              >
                {t.generateBtn.replace('{0}', typeLabel)}
              </Button>
           </div>
        )}
      </div>
    </div>
  );
};


// --- App Component ---

export default function App() {
  const [lang, setLang] = useState<Lang>('en');
  const t = TRANSLATIONS[lang];

  const [showIntro, setShowIntro] = useState(true);
  const [view, setView] = useState<AppView>('dashboard');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [generatedMockups, setGeneratedMockups] = useState<GeneratedMockup[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedMockup, setSelectedMockup] = useState<GeneratedMockup | null>(null); // State for lightbox

  // Intro Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Form states for generation
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [placedLogos, setPlacedLogos] = useState<PlacedLayer[]>([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState<LoadingState>({ isGenerating: false, message: '' });

  // API Key Management
  const { showApiKeyDialog, setShowApiKeyDialog, validateApiKey, handleApiKeyDialogContinue } = useApiKey();

  // API Error Handling Logic
  const handleApiError = (error: any) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    let shouldOpenDialog = false;

    // Check for specific Server-side Error Signatures
    if (errorMessage.includes('Requested entity was not found')) {
      console.warn('Model not found - likely a billing/key issue');
      shouldOpenDialog = true;
    } else if (
      errorMessage.includes('API_KEY_INVALID') ||
      errorMessage.includes('API key not valid') ||
      errorMessage.includes('PERMISSION_DENIED') || 
      errorMessage.includes('403')
    ) {
      console.warn('Invalid API Key or Permissions');
      shouldOpenDialog = true;
    }

    if (shouldOpenDialog) {
      setShowApiKeyDialog(true);
    } else {
      alert(`Operation failed: ${errorMessage}`);
    }
  };

  // State for Dragging
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedItem, setDraggedItem] = useState<{ uid: string, startX: number, startY: number, initX: number, initY: number } | null>(null);

  // -- LOGO PLACEMENT HANDLERS --

  const addLogoToCanvas = (assetId: string) => {
    // Add new instance of logo to canvas at center
    const newLayer: PlacedLayer = {
      uid: Math.random().toString(36).substr(2, 9),
      assetId,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0
    };
    setPlacedLogos(prev => [...prev, newLayer]);
  };

  const removeLogoFromCanvas = (uid: string, e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation();
    setPlacedLogos(prev => prev.filter(l => l.uid !== uid));
  };

  const handleStart = (clientX: number, clientY: number, layer: PlacedLayer) => {
    setDraggedItem({
      uid: layer.uid,
      startX: clientX,
      startY: clientY,
      initX: layer.x,
      initY: layer.y
    });
  };

  const handleMouseDown = (e: React.MouseEvent, layer: PlacedLayer) => {
    e.preventDefault();
    e.stopPropagation();
    handleStart(e.clientX, e.clientY, layer);
  };

  const handleTouchStart = (e: React.TouchEvent, layer: PlacedLayer) => {
    e.stopPropagation(); // Prevent scrolling initiation if possible
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY, layer);
  };

  const handleWheel = (e: React.WheelEvent, layerId: string) => {
     e.stopPropagation();
     // Simple scale on scroll
     const delta = e.deltaY > 0 ? -0.1 : 0.1;
     setPlacedLogos(prev => prev.map(l => {
        if (l.uid !== layerId) return l;
        const newScale = Math.max(0.2, Math.min(3.0, l.scale + delta));
        return { ...l, scale: newScale };
     }));
  };

  // Global mouse/touch move for dragging
  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!draggedItem || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const deltaX = clientX - draggedItem.startX;
      const deltaY = clientY - draggedItem.startY;

      // Convert pixels to percentage
      const deltaXPercent = (deltaX / rect.width) * 100;
      const deltaYPercent = (deltaY / rect.height) * 100;

      setPlacedLogos(prev => prev.map(l => {
        if (l.uid !== draggedItem.uid) return l;
        return {
          ...l,
          x: Math.max(0, Math.min(100, draggedItem.initX + deltaXPercent)),
          y: Math.max(0, Math.min(100, draggedItem.initY + deltaYPercent))
        };
      }));
    };

    const onMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const onMouseUp = () => {
      setDraggedItem(null);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (draggedItem) {
         e.preventDefault(); // Prevent scrolling while dragging
         handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTouchEnd = () => {
      setDraggedItem(null);
    };

    if (draggedItem) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove, { passive: false }); // passive: false needed for preventDefault
      window.addEventListener('touchend', onTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [draggedItem]);


  const handleGenerate = async () => {
    // We don't return early for empty selections here so we can give better user feedback
    if (!selectedProductId && placedLogos.length === 0) {
        // Although button is disabled, safety check
        return;
    }
    
    const product = assets.find(a => a.id === selectedProductId);
    if (!product) {
        alert("Selected product not found. Please select a product.");
        // Deselect the invalid ID so the UI updates
        setSelectedProductId(null);
        return;
    }

    // Prepare all layers
    const layers = placedLogos.map(layer => {
        const asset = assets.find(a => a.id === layer.assetId);
        return asset ? { asset, placement: layer } : null;
    }).filter(Boolean) as { asset: Asset, placement: PlacedLayer }[];

    if (layers.length === 0) {
         alert("No valid logos found on canvas. Please add a logo.");
         return;
    }

    // Check API Key before proceeding
    if (!(await validateApiKey())) {
      return;
    }

    const currentPrompt = prompt;

    setLoading({ isGenerating: true, message: t.loadingAnalysis });
    try {
      const resultImage = await generateMockup(product, layers, currentPrompt);
      
      const newMockup: GeneratedMockup = {
        id: Math.random().toString(36).substring(7),
        imageUrl: resultImage,
        prompt: currentPrompt,
        createdAt: Date.now(),
        layers: placedLogos, // Save the layout
        productId: selectedProductId
      };
      
      setGeneratedMockups(prev => [newMockup, ...prev]);
      setView('gallery');
    } catch (e: any) {
      console.error(e);
      handleApiError(e);
    } finally {
      setLoading({ isGenerating: false, message: '' });
    }
  };

  const toggleLang = () => {
    setLang(l => l === 'en' ? 'zh' : 'en');
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex overflow-hidden relative">
      
      {showIntro && <IntroSequence lang={lang} />}

      {/* API Key Dialog */}
      {showApiKeyDialog && (
        <ApiKeyDialog onContinue={handleApiKeyDialogContinue} />
      )}

      {/* Sidebar Navigation (Desktop) */}
      <aside className="w-64 border-r border-zinc-200 bg-white/50 hidden md:flex flex-col">
        <div className="h-16 border-b border-zinc-200 flex items-center px-6">
          <NobeeLogo className="w-8 h-8 mr-2" />
          <span className="font-bold text-lg tracking-tight text-zinc-900">{t.appTitle}</span>
        </div>

        <div className="p-4 space-y-2 flex-1">
          <NavButton 
            icon={<Layout size={18} />} 
            label={t.dashboard}
            active={view === 'dashboard'} 
            onClick={() => setView('dashboard')} 
          />
          <NavButton 
            icon={<Box size={18} />} 
            label={t.assets}
            active={view === 'assets'} 
            number={1}
            onClick={() => setView('assets')} 
          />
          <NavButton 
            icon={<Wand2 size={18} />} 
            label={t.studio}
            active={view === 'studio'} 
            number={2}
            onClick={() => setView('studio')} 
          />
          <NavButton 
            icon={<ImageIcon size={18} />} 
            label={t.gallery}
            active={view === 'gallery'} 
            number={3}
            onClick={() => setView('gallery')} 
          />
        </div>

        <div className="p-4 border-t border-zinc-200">
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 text-center">
             <Button size="sm" variant="outline" className="w-full text-xs">{t.documentation}</Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4 z-50">
        <div className="flex items-center">
          <NobeeLogo className="w-8 h-8 mr-2" />
          <span className="font-bold text-lg text-zinc-900">{t.appTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleLang}
            className="p-2 text-zinc-600 hover:text-black rounded-full hover:bg-zinc-100"
          >
            <Globe size={20} />
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-zinc-600 hover:text-black">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-white/95 backdrop-blur-xl p-4 animate-fade-in flex flex-col">
          <div className="space-y-2">
            <NavButton 
              icon={<Layout size={18} />} 
              label={t.dashboard}
              active={view === 'dashboard'} 
              onClick={() => { setView('dashboard'); setIsMobileMenuOpen(false); }} 
            />
            <NavButton 
              icon={<Box size={18} />} 
              label={t.assets}
              active={view === 'assets'} 
              number={1}
              onClick={() => { setView('assets'); setIsMobileMenuOpen(false); }} 
            />
            <NavButton 
              icon={<Wand2 size={18} />} 
              label={t.studio}
              active={view === 'studio'} 
              number={2}
              onClick={() => { setView('studio'); setIsMobileMenuOpen(false); }} 
            />
            <NavButton 
              icon={<ImageIcon size={18} />} 
              label={t.gallery}
              active={view === 'gallery'} 
              number={3}
              onClick={() => { setView('gallery'); setIsMobileMenuOpen(false); }} 
            />
          </div>
          
          <div className="mt-auto pb-8 border-t border-zinc-200 pt-6">
              <p className="text-xs text-zinc-500 text-center mb-4">{t.mobileFooter}</p>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedMockup && (
        <div 
          className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" 
          onClick={() => setSelectedMockup(null)}
        >
          <div className="relative max-w-6xl w-full h-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
            {/* Close Button */}
            <button 
              onClick={() => setSelectedMockup(null)}
              className="absolute top-4 right-4 md:top-0 md:-right-12 p-2 bg-white text-zinc-900 rounded-full hover:bg-zinc-100 transition-colors z-50 border border-zinc-200 shadow-lg"
            >
              <X size={24} />
            </button>

            {/* Image Container */}
            <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden rounded-lg">
              <img 
                src={selectedMockup.imageUrl} 
                alt="Full size preview" 
                className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-lg" 
              />
            </div>

            {/* Caption / Actions */}
            <div className="mt-4 bg-white/90 backdrop-blur border border-zinc-200 px-6 py-3 rounded-full flex items-center gap-4 shadow-lg">
               <p className="text-sm text-zinc-600 max-w-[200px] md:max-w-md truncate">
                 {selectedMockup.prompt || t.generatedMockups}
               </p>
               <div className="h-4 w-px bg-zinc-300"></div>
               <a 
                 href={selectedMockup.imageUrl} 
                 download={`mockup-${selectedMockup.id}.png`}
                 className="text-[#ab6b00] hover:text-[#eac415] text-sm font-medium flex items-center gap-2"
               >
                 <Download size={16} />
                 {t.download}
               </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative pt-16 md:pt-0">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200 flex items-center justify-between px-8">
           <div className="text-sm text-zinc-500 breadcrumbs">
              <span className="opacity-50">App</span> 
              <span className="mx-2">/</span> 
              <span className="text-zinc-900 capitalize font-medium">{t[view] || view}</span>
           </div>
           <div className="flex items-center gap-4">
              <button 
                onClick={toggleLang}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-black transition-colors"
                title="Switch Language"
              >
                <Globe size={18} />
                <span className="text-sm font-medium">{lang === 'en' ? 'EN' : '繁中'}</span>
              </button>
              <Button size="sm" variant="ghost" icon={<Sparkles size={16}/>}>{t.creditsCount}</Button>
           </div>
        </div>

        <div className="max-w-6xl mx-auto p-6 md:p-12">
           
           {/* --- DASHBOARD VIEW --- */}
           {view === 'dashboard' && (
              <div className="animate-fade-in space-y-8">
                 <div className="text-center py-12">
                    <h1 className="text-4xl md:text-6xl font-black mb-6 text-zinc-900">
                       {t.dashboardTitle.split(' ').slice(0, 2).join(' ')} <br/>
                       <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#eac415] to-[#ab6b00]">
                         {t.dashboardTitle.split(' ').slice(2).join(' ')}
                       </span>
                    </h1>
                    <p className="text-zinc-600 text-lg max-w-2xl mx-auto mb-10">
                       {t.dashboardSubtitle}
                    </p>
                    <Button size="lg" onClick={() => setView('assets')} icon={<ArrowRight size={20} />}>
                       {t.startCreating}
                    </Button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                       { icon: <Box className="text-[#ab6b00]" />, title: t.featAsset, desc: t.featAssetDesc },
                       { icon: <Wand2 className="text-[#eac415]" />, title: t.featCompositing, desc: t.featCompositingDesc },
                       { icon: <Download className="text-[#ab6b00]" />, title: t.featExport, desc: t.featExportDesc }
                    ].map((feat, i) => (
                       <div key={i} className="p-6 rounded-2xl bg-white border border-zinc-200 hover:border-[#eac415] hover:shadow-lg transition-all shadow-sm">
                          <div className="mb-4 p-3 bg-zinc-50 w-fit rounded-lg border border-zinc-100">{feat.icon}</div>
                          <h3 className="text-xl font-bold mb-2 text-zinc-900">{feat.title}</h3>
                          <p className="text-zinc-500">{feat.desc}</p>
                       </div>
                    ))}
                 </div>
                 
                 <footer className="mt-20 pt-8 border-t border-zinc-200 text-center">
                    <p className="text-zinc-500 text-sm max-w-2xl mx-auto leading-relaxed whitespace-pre-line">
                       {t.footerText}
                    </p>
                 </footer>
              </div>
           )}

           {/* --- ASSETS VIEW --- */}
           {view === 'assets' && (
              <div className="animate-fade-in">
                <WorkflowStepper currentView="assets" onViewChange={setView} lang={lang} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Products Section */}
                  <AssetSection 
                    title={t.products} 
                    icon={<Box size={20} />}
                    type="product"
                    assets={assets.filter(a => a.type === 'product')}
                    onAdd={(a) => setAssets(prev => [...prev, a])}
                    onRemove={(id) => setAssets(prev => prev.filter(a => a.id !== id))}
                    validateApiKey={validateApiKey}
                    onApiError={handleApiError}
                    lang={lang}
                  />

                  {/* Logos Section */}
                  <AssetSection 
                    title={t.logosGraphics} 
                    icon={<Layers size={20} />}
                    type="logo"
                    assets={assets.filter(a => a.type === 'logo')}
                    onAdd={(a) => setAssets(prev => [...prev, a])}
                    onRemove={(id) => setAssets(prev => prev.filter(a => a.id !== id))}
                    validateApiKey={validateApiKey}
                    onApiError={handleApiError}
                    lang={lang}
                  />
                </div>

                <div className="mt-8 flex justify-end">
                   <Button onClick={() => setView('studio')} disabled={assets.length < 2} icon={<ArrowRight size={16} />}>
                      {t.continueToStudio}
                   </Button>
                </div>
              </div>
           )}

           {/* --- STUDIO VIEW --- */}
           {view === 'studio' && (
             <div className="animate-fade-in h-[calc(100vh-8rem)] md:h-[calc(100vh-12rem)] flex flex-col-reverse lg:flex-row gap-4 lg:gap-6">
                {/* Left Controls (Bottom on Mobile) */}
                <div className="w-full lg:w-80 flex flex-col gap-6 glass-panel p-6 rounded-2xl overflow-y-auto flex-1 lg:flex-none bg-white border border-zinc-200">
                   <div>
                      <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">1. {t.selectProduct}</h3>
                      <div className="grid grid-cols-3 gap-2">
                         {assets.filter(a => a.type === 'product').map(a => (
                            <div 
                               key={a.id} 
                               onClick={() => setSelectedProductId(selectedProductId === a.id ? null : a.id)}
                               className={`aspect-square rounded-lg border-2 cursor-pointer p-1 transition-all ${selectedProductId === a.id ? 'border-[#eac415] bg-[#eac415]/20' : 'border-zinc-200 hover:border-zinc-400 bg-zinc-50'}`}
                            >
                               <img src={a.data} className="w-full h-full object-contain" alt={a.name} />
                            </div>
                         ))}
                         {assets.filter(a => a.type === 'product').length === 0 && <p className="text-xs text-zinc-400 col-span-3">{t.noProducts}</p>}
                      </div>
                   </div>

                   <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">2. {t.addLogos}</h3>
                        {placedLogos.length > 0 && (
                            <span className="text-xs text-[#ab6b00]">{placedLogos.length} {t.onCanvas}</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mb-2">{t.clickToAddLogo}</p>
                      <div className="grid grid-cols-3 gap-2">
                         {assets.filter(a => a.type === 'logo').map(a => (
                            <div 
                               key={a.id} 
                               onClick={() => addLogoToCanvas(a.id)}
                               className={`relative aspect-square rounded-lg border-2 cursor-pointer p-1 transition-all border-zinc-200 hover:border-zinc-400 bg-zinc-50`}
                            >
                               <img src={a.data} className="w-full h-full object-contain" alt={a.name} />
                               {/* Count badge */}
                               {placedLogos.filter(l => l.assetId === a.id).length > 0 && (
                                   <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#eac415] rounded-full flex items-center justify-center text-[10px] font-bold border border-white text-black shadow-sm">
                                       {placedLogos.filter(l => l.assetId === a.id).length}
                                   </div>
                               )}
                            </div>
                         ))}
                         {assets.filter(a => a.type === 'logo').length === 0 && <p className="text-xs text-zinc-400 col-span-3">{t.noLogos}</p>}
                      </div>
                   </div>

                   <div>
                      <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">3. {t.instructions}</h3>
                      <textarea 
                         className="w-full bg-zinc-50 border border-zinc-300 rounded-lg p-3 text-base text-zinc-900 focus:ring-2 focus:ring-[#eac415] focus:outline-none resize-none h-24 placeholder:text-zinc-400 focus:border-[#eac415]"
                         placeholder={t.instrPlaceholder}
                         value={prompt}
                         onChange={(e) => setPrompt(e.target.value)}
                      />
                   </div>

                   <Button 
                      onClick={handleGenerate} 
                      isLoading={loading.isGenerating} 
                      disabled={!selectedProductId || placedLogos.length === 0} 
                      size="lg" 
                      className="mt-auto"
                      icon={<Wand2 size={18} />}
                   >
                      {t.generateMockup}
                   </Button>
                </div>

                {/* Right Preview - Canvas (Top on Mobile) */}
                <div className="h-[45vh] lg:h-auto lg:flex-1 glass-panel rounded-2xl flex items-center justify-center bg-zinc-100 relative overflow-hidden select-none flex-shrink-0 border border-zinc-200 shadow-inner">
                   {loading.isGenerating && (
                      <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                         <div className="w-16 h-16 border-4 border-[#eac415] border-t-transparent rounded-full animate-spin mb-4"></div>
                         <p className="text-[#ab6b00] font-mono animate-pulse">{loading.message}</p>
                      </div>
                   )}
                   
                   {selectedProductId ? (
                      <div 
                         ref={canvasRef}
                         className="relative w-full h-full max-h-[600px] p-4"
                      >
                         {/* Product Base */}
                         <img 
                            src={assets.find(a => a.id === selectedProductId)?.data} 
                            className="w-full h-full object-contain drop-shadow-xl pointer-events-none select-none" 
                            alt="Preview" 
                            draggable={false}
                         />

                         {/* Overlay Layers */}
                         {placedLogos.map((layer) => {
                            const logoAsset = assets.find(a => a.id === layer.assetId);
                            if (!logoAsset) return null;
                            const isDraggingThis = draggedItem?.uid === layer.uid;

                            return (
                               <div
                                  key={layer.uid}
                                  className={`absolute cursor-move group ${isDraggingThis ? 'z-50 opacity-80' : 'z-10'}`}
                                  style={{
                                     left: `${layer.x}%`,
                                     top: `${layer.y}%`,
                                     transform: `translate(-50%, -50%) scale(${layer.scale}) rotate(${layer.rotation}deg)`,
                                     // We use a fixed width for the container relative to viewport/container would be better but simplified here
                                     width: '15%', // Base width relative to container
                                     aspectRatio: '1/1'
                                  }}
                                  onMouseDown={(e) => handleMouseDown(e, layer)}
                                  onTouchStart={(e) => handleTouchStart(e, layer)}
                                  onWheel={(e) => handleWheel(e, layer.uid)}
                               >
                                  {/* Selection Border */}
                                  <div className="absolute -inset-2 border-2 border-[#eac415]/0 group-hover:border-[#eac415]/50 rounded-lg transition-all pointer-events-none"></div>
                                  
                                  {/* Remove Button */}
                                  <button 
                                    onClick={(e) => removeLogoFromCanvas(layer.uid, e)}
                                    onTouchEnd={(e) => removeLogoFromCanvas(layer.uid, e)}
                                    className="absolute -top-4 -right-4 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg z-50"
                                    title="Remove"
                                  >
                                    <X size={12} />
                                  </button>

                                  <img 
                                     src={logoAsset.data} 
                                     className="w-full h-full object-contain drop-shadow-lg pointer-events-none"
                                     draggable={false}
                                     alt="layer"
                                  />
                               </div>
                            );
                         })}
                      </div>
                   ) : (
                      <div className="text-center text-zinc-400">
                         <Shirt size={64} className="mx-auto mb-4 opacity-20 text-zinc-500" />
                         <p>{t.selectProductToStart}</p>
                      </div>
                   )}
                </div>
             </div>
           )}

           {/* --- GALLERY VIEW --- */}
           {view === 'gallery' && (
              <div className="animate-fade-in">
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-zinc-900">{t.generatedMockups}</h2>
                    <Button variant="outline" onClick={() => setView('studio')} icon={<Plus size={16}/>}>{t.newMockup}</Button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {generatedMockups.map(mockup => (
                       <div key={mockup.id} className="group glass-panel rounded-xl overflow-hidden bg-white border border-zinc-200 shadow-sm">
                          <div className="aspect-square bg-zinc-100 relative overflow-hidden">
                             <img src={mockup.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Mockup" />
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button 
                                  size="sm" 
                                  variant="secondary" 
                                  icon={<Maximize size={16}/>}
                                  onClick={() => setSelectedMockup(mockup)}
                                >
                                  {t.view}
                                </Button>
                                <a href={mockup.imageUrl} download={`mockup-${mockup.id}.png`}>
                                  <Button size="sm" variant="primary" icon={<Download size={16}/>}>{t.save}</Button>
                                </a>
                             </div>
                          </div>
                          <div className="p-4">
                             <p className="text-xs text-zinc-500 mb-1">{new Date(mockup.createdAt).toLocaleDateString()}</p>
                             <p className="text-sm text-zinc-800 line-clamp-2">{mockup.prompt || "Auto-generated mockup"}</p>
                             {mockup.layers && mockup.layers.length > 0 && (
                                 <div className="mt-2 flex gap-1">
                                     <span className="text-xs px-1.5 py-0.5 bg-zinc-100 rounded text-zinc-500 border border-zinc-200">{mockup.layers.length} {t.logo.toLowerCase()}s</span>
                                 </div>
                             )}
                          </div>
                       </div>
                    ))}
                    {generatedMockups.length === 0 && (
                       <div className="col-span-full py-20 text-center glass-panel rounded-xl bg-white border border-zinc-200">
                          <ImageIcon size={48} className="mx-auto mb-4 text-zinc-300" />
                          <h3 className="text-lg font-medium text-zinc-900">{t.noMockups}</h3>
                          <p className="text-zinc-500 mb-6">{t.createFirst}</p>
                          <Button onClick={() => setView('studio')}>{t.goToStudio}</Button>
                       </div>
                    )}
                 </div>
              </div>
           )}
        </div>
      </main>
    </div>
  );
}