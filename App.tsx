
import React, { useState, useEffect, useRef } from 'react';
import { DATES, DaySchedule, ItemType, ItineraryState, TripData, ShoppingCategory } from './types';
import { ItemCard, AddItemModal } from './components/ItineraryComponents';
import { ResourcesPage } from './components/ResourcesPage';
import { PlusIcon, CloudSunIcon, ListIcon, InfoIcon, DollarIcon, ShoppingBagIcon, EditIcon, CloudIcon, DownloadIcon, ShareIcon, FileTextIcon, ImageOffIcon, PhotoIcon } from './components/Icons';

// Initialize with empty schedule structure
const INITIAL_ITINERARY: ItineraryState = DATES.reduce((acc, curr) => {
  acc[curr.date] = {
    ...curr,
    locationHint: '沖繩 Okinawa',
    items: [],
    generalWeather: '晴朗, 22°C'
  };
  return acc;
}, {} as ItineraryState);

const INITIAL_SHOPPING_CATEGORIES: ShoppingCategory[] = [];

const INITIAL_TRIP_DATA: TripData = {
    appTitle: "OKA探險隊",
    appDeclaration: "帶著一顆快樂的心，該買就買！該吃就吃！",
    flights: {
        north: { outbound: { date: '2026-03-11', time: '09:00', arrivalTime: '11:30', airline: '', flightNumber: '', terminal: '' }, inbound: { date: '2026-03-15', time: '14:00', arrivalTime: '16:30', airline: '', flightNumber: '', terminal: '' } },
        south: { outbound: { date: '2026-03-11', time: '10:00', arrivalTime: '12:30', airline: '', flightNumber: '', terminal: '' }, inbound: { date: '2026-03-15', time: '15:00', arrivalTime: '17:30', airline: '', flightNumber: '', terminal: '' } }
    },
    contacts: [],
    expenses: [],
    shoppingTitle: "購物清單",
    shoppingCategories: INITIAL_SHOPPING_CATEGORIES,
    shoppingList: [],
    shoppingLocations: [],
    shoppingLocationTitle: "購物地點",
    exchangeRate: 0.22 
};

type Tab = 'itinerary' | 'info' | 'money' | 'shopping';

const SyncModal = ({ 
    isOpen, 
    onClose, 
    onImport,
    itinerary,
    tripData
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    onImport: (dataStr: string) => boolean;
    itinerary: ItineraryState;
    tripData: TripData;
}) => {
    const [mode, setMode] = useState<'SELECT' | 'EXPORT_LIGHT' | 'IMPORT'>('SELECT');
    const [importStr, setImportStr] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);
    const [importError, setImportError] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    // Light Export: Text Only (Suitable for LINE)
    const handleCopyLight = () => {
        // Strip images from data to reduce size
        const cleanTripData = { ...tripData };
        cleanTripData.contacts = cleanTripData.contacts.map(c => ({...c, avatar: undefined}));
        cleanTripData.shoppingList = cleanTripData.shoppingList.map(i => ({...i, image: undefined}));

        const exportObj = { i: itinerary, d: cleanTripData };
        
        try {
            const jsonStr = JSON.stringify(exportObj);
            const utf8Bytes = new TextEncoder().encode(jsonStr);
            const binaryStr = Array.from(utf8Bytes, byte => String.fromCharCode(byte)).join('');
            const exportStr = btoa(binaryStr);
            
            navigator.clipboard.writeText(exportStr).then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            });
        } catch (e) {
            alert("匯出失敗，請重試");
        }
    };

    // Full Export: Download as File (Preserves Images)
    const handleDownloadFull = () => {
        const exportObj = { i: itinerary, d: tripData };
        try {
            const jsonStr = JSON.stringify(exportObj);
            const blob = new Blob([jsonStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `okinawa-backup-${new Date().toISOString().slice(0,10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            alert("備份檔建立失敗");
        }
    };

    const handleImportSubmit = () => {
        const success = onImport(importStr.trim());
        if (success) {
            onClose();
            setMode('SELECT');
            setImportStr('');
            setImportError(false);
        } else {
            setImportError(true);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const jsonStr = event.target?.result as string;
                // Basic validation
                const decoded = JSON.parse(jsonStr);
                if (decoded.i && decoded.d) {
                    // Bypass the base64 decoding used in text import since we have raw JSON
                    // We need to slightly modify onImport to handle object or adapt here.
                    // For simplicity, let's just create a "fake" base64 string to reuse onImport 
                    // OR better: let's update handleImportData to accept object or handle this logic.
                    // Actually, simpler to just inject directly if we could, but onImport takes a string.
                    // Let's re-encode it to passed to onImport for consistency, OR call a new prop. 
                    // To keep things simple without changing props too much:
                    
                    const utf8Bytes = new TextEncoder().encode(jsonStr);
                    const binaryStr = Array.from(utf8Bytes, byte => String.fromCharCode(byte)).join('');
                    const base64 = btoa(binaryStr);
                    const success = onImport(base64);
                    
                    if (success) {
                        alert("備份檔還原成功！");
                        onClose();
                        setMode('SELECT');
                    } else {
                        alert("檔案格式錯誤");
                    }
                } else {
                    alert("無效的備份檔案");
                }
            } catch (err) {
                alert("讀取檔案失敗");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-6 relative">
                <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-bold text-sumi">雲端同步 (手動)</h3>
                     <button onClick={onClose} className="bg-stone-100 p-2 rounded-full text-stone-500 hover:bg-stone-200">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                     </button>
                </div>

                {mode === 'SELECT' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                             {/* Light Export */}
                            <button onClick={() => setMode('EXPORT_LIGHT')} className="bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-2xl p-4 flex flex-col items-center gap-2 transition-colors">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-stone-600">
                                    <FileTextIcon className="w-5 h-5" />
                                </div>
                                <div className="text-center">
                                    <span className="font-bold text-sumi text-sm block">輕量匯出</span>
                                    <span className="text-[10px] text-stone-400 block mt-0.5">適合 LINE (無圖片)</span>
                                </div>
                            </button>

                             {/* Full Export */}
                             <button onClick={handleDownloadFull} className="bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-2xl p-4 flex flex-col items-center gap-2 transition-colors">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-ocean">
                                    <DownloadIcon className="w-5 h-5" />
                                </div>
                                <div className="text-center">
                                    <span className="font-bold text-ocean text-sm block">完整備份</span>
                                    <span className="text-[10px] text-stone-400 block mt-0.5">下載檔案 (含圖片)</span>
                                </div>
                            </button>
                        </div>

                        <div className="relative py-2">
                             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-100"></div></div>
                             <div className="relative flex justify-center"><span className="bg-white px-2 text-xs text-stone-300">OR</span></div>
                        </div>

                        {/* Import */}
                        <button onClick={() => setMode('IMPORT')} className="w-full bg-terracotta/10 hover:bg-terracotta/20 border border-terracotta/20 rounded-2xl p-4 flex items-center justify-center gap-3 transition-colors">
                            <ShareIcon className="w-5 h-5 text-terracotta" />
                            <span className="font-bold text-terracotta">匯入資料 (代碼或檔案)</span>
                        </button>
                    </div>
                )}

                {mode === 'EXPORT_LIGHT' && (
                    <div className="space-y-4">
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex gap-3 items-start">
                             <ImageOffIcon className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                             <p className="text-xs text-orange-800 leading-relaxed">
                                此模式將<b>移除所有照片</b>以縮短代碼長度，確保可透過通訊軟體傳送。若需備份照片，請使用「完整備份」。
                             </p>
                        </div>
                        <button onClick={handleCopyLight} className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-md ${copySuccess ? 'bg-green-500 text-white' : 'bg-sumi text-white hover:bg-black'}`}>
                            {copySuccess ? '已複製代碼！請貼到 LINE' : '複製純文字代碼'}
                        </button>
                        <button onClick={() => setMode('SELECT')} className="text-xs text-stone-400 font-bold w-full text-center hover:underline py-2">返回選單</button>
                    </div>
                )}

                {mode === 'IMPORT' && (
                    <div className="space-y-5">
                         {/* File Import */}
                         <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-xl p-4 text-center relative group hover:border-ocean/50 transition-colors">
                             <input 
                                type="file" 
                                accept=".json"
                                ref={fileInputRef}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileUpload}
                             />
                             <div className="pointer-events-none flex flex-col items-center gap-2">
                                <CloudIcon className="w-6 h-6 text-stone-300 group-hover:text-ocean" />
                                <span className="text-xs font-bold text-stone-500 group-hover:text-ocean">點擊上傳備份檔 (.json)</span>
                             </div>
                         </div>

                         <div className="relative py-1">
                             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-100"></div></div>
                             <div className="relative flex justify-center"><span className="bg-white px-2 text-xs text-stone-300">或貼上代碼</span></div>
                        </div>

                         <textarea 
                            value={importStr}
                            onChange={e => setImportStr(e.target.value)}
                            placeholder="在此貼上輕量匯出代碼..."
                            className="w-full h-24 bg-stone-50 rounded-xl p-3 text-xs font-mono border border-stone-200 focus:border-terracotta outline-none resize-none"
                        />
                        
                        {importError && <p className="text-xs text-red-500 font-bold text-center animate-pulse">代碼無效或格式錯誤</p>}
                        
                        <div className="flex gap-2">
                             <button onClick={() => setMode('SELECT')} className="flex-1 bg-stone-100 text-stone-500 font-bold py-3 rounded-xl text-xs">取消</button>
                             <button onClick={handleImportSubmit} disabled={!importStr} className="flex-1 bg-terracotta text-white font-bold py-3 rounded-xl text-xs disabled:opacity-50">確認匯入</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function App() {
  const [activeDate, setActiveDate] = useState<string>(DATES[0].date);
  const [itinerary, setItinerary] = useState<ItineraryState>(INITIAL_ITINERARY);
  const [tripData, setTripData] = useState<TripData>(INITIAL_TRIP_DATA);
  const [activeTab, setActiveTab] = useState<Tab>('itinerary');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  useEffect(() => {
    const savedItinerary = localStorage.getItem('tabilog-okinawa-2026');
    const savedTripData = localStorage.getItem('tabilog-okinawa-2026-data-v3');
    
    if (savedItinerary) {
      try {
        setItinerary(JSON.parse(savedItinerary));
      } catch (e) {
        console.error("Failed to parse saved itinerary");
      }
    }
    if (savedTripData) {
       try {
        const parsed = JSON.parse(savedTripData);
        if (!parsed.shoppingCategories) parsed.shoppingCategories = INITIAL_SHOPPING_CATEGORIES;
        if (!parsed.shoppingTitle) parsed.shoppingTitle = "購物清單";
        if (!parsed.shoppingLocations) parsed.shoppingLocations = [];
        if (!parsed.shoppingLocationTitle) parsed.shoppingLocationTitle = "購物地點";
        setTripData({ ...INITIAL_TRIP_DATA, ...parsed });
      } catch (e) {
        console.error("Failed to parse saved trip data");
      } 
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tabilog-okinawa-2026', JSON.stringify(itinerary));
  }, [itinerary]);

  useEffect(() => {
    localStorage.setItem('tabilog-okinawa-2026-data-v3', JSON.stringify(tripData));
  }, [tripData]);

  const handleImportData = (dataStr: string) => {
      try {
          // FIX: Use TextDecoder for UTF-8 support
          const binaryStr = atob(dataStr);
          const utf8Bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
              utf8Bytes[i] = binaryStr.charCodeAt(i);
          }
          const decodedStr = new TextDecoder().decode(utf8Bytes);
          const decoded = JSON.parse(decodedStr);
          
          if (decoded.i && decoded.d) {
              setItinerary(decoded.i);
              setTripData(decoded.d);
              return true;
          }
      } catch (e) {
          console.error("Import failed", e);
      }
      return false;
  };

  // FIX: Provide complete DaySchedule fallback to satisfy TS
  const currentDay = itinerary[activeDate] || { 
      date: activeDate,
      dayLabel: 'Loading...', 
      weekday: '',
      locationHint: '',
      items: [], 
      generalWeather: '' 
  };

  const handleAddItem = (newItem: any) => {
    const itemWithId = { ...newItem, id: Date.now().toString() };
    setItinerary(prev => {
        const daySchedule = prev[activeDate];
        const newItems = [...daySchedule.items, itemWithId].sort((a, b) => a.time.localeCompare(b.time));
        return {
            ...prev,
            [activeDate]: {
                ...daySchedule,
                items: newItems,
                locationHint: newItem.location.split(' ')[0] || daySchedule.locationHint
            }
        };
    });
  };

  const handleDeleteItem = (itemId: string) => {
    setItinerary(prev => {
        const daySchedule = prev[activeDate];
        const newItems = daySchedule.items.filter(i => i.id !== itemId);
        return {
            ...prev,
            [activeDate]: {
                ...daySchedule,
                items: newItems
            }
        };
    });
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] pb-28 max-w-md mx-auto border-x border-stone-100 shadow-2xl relative overflow-hidden text-sumi">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#fcfbf9]/95 backdrop-blur-xl pt-20 px-7 transition-all">
        <div className="flex justify-between items-start mb-0">
            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-ocean text-[10px] font-bold tracking-[0.25em] uppercase">Okinawa Trip</p>
                    <button onClick={() => setIsSyncModalOpen(true)} className="flex items-center gap-1 bg-ocean/5 px-2 py-1 rounded-full hover:bg-ocean/10 transition-colors">
                        <CloudIcon className="w-3 h-3 text-ocean" />
                        <span className="text-[9px] font-bold text-ocean">雲端同步</span>
                    </button>
                </div>

                {isEditingTitle ? (
                    <input 
                        type="text" 
                        value={tripData.appTitle}
                        onChange={(e) => setTripData({...tripData, appTitle: e.target.value})}
                        onBlur={() => setIsEditingTitle(false)}
                        autoFocus
                        className="text-3xl font-bold text-sumi w-full bg-transparent outline-none border-b border-ocean"
                    />
                ) : (
                    <h1 onClick={() => setIsEditingTitle(true)} className="text-3xl font-bold text-sumi tracking-tight leading-none cursor-pointer flex items-center gap-2 group">
                        {tripData.appTitle}
                        <EditIcon className="w-5 h-5 text-stone-200 group-hover:text-ocean transition-colors" />
                    </h1>
                )}
                
                {/* Editable Declaration */}
                <div className="mt-3 relative">
                    <textarea 
                        value={tripData.appDeclaration}
                        onChange={(e) => setTripData({...tripData, appDeclaration: e.target.value})}
                        className="w-full text-xs font-medium text-stone-500 bg-transparent resize-none outline-none focus:text-stone-700 transition-all py-1 leading-relaxed pl-0"
                        rows={2}
                        placeholder="點擊輸入旅遊宣言..."
                    />
                </div>
            </div>
        </div>

        {/* Divider Line */}
        <div className="w-full h-px bg-stone-100 mt-4 mb-6 relative overflow-visible"></div>

        {/* Date Grid Tabs (5 Columns) */}
        {activeTab === 'itinerary' && (
            <div className="grid grid-cols-5 gap-2 pb-4 pt-0 w-full">
            {DATES.map((d) => {
                const isActive = d.date === activeDate;
                const hasItems = itinerary[d.date]?.items.length > 0;
                return (
                <button
                    key={d.date}
                    onClick={() => setActiveDate(d.date)}
                    className={`flex flex-col items-center justify-center w-full h-16 rounded-2xl transition-all duration-300 border ${
                    isActive 
                    ? 'bg-ocean border-ocean text-white shadow-lg shadow-ocean/30 scale-105' 
                    : 'bg-white border-stone-100 text-stone-400 hover:border-stone-200'
                    }`}
                >
                    <span className={`text-[10px] font-bold tracking-widest uppercase mb-0.5 ${isActive ? 'opacity-90' : 'opacity-60'}`}>{d.weekday}</span>
                    <span className="text-xl font-bold">{d.date.split('-')[2]}</span>
                    {hasItems && !isActive && <div className="w-1 h-1 rounded-full bg-terracotta mt-1" />}
                </button>
                );
            })}
            </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="min-h-[60vh]">
        {activeTab === 'itinerary' ? (
             <div className="px-7 pt-0 animate-[fadeIn_0.3s_ease-out]">
                {/* Day Header */}
                <div className="flex items-center justify-between mb-8 px-1">
                    <h2 className="text-xl font-bold text-sumi tracking-tight">
                        {currentDay.dayLabel} 
                    </h2>
                </div>

                {/* Empty State */}
                {currentDay.items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 text-stone-200 border border-stone-100 shadow-soft">
                            <CloudSunIcon className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="text-sumi font-bold text-base tracking-widest">尚無行程</p>
                        <p className="text-stone-400 text-xs mt-2 font-medium">點擊下方按鈕開始規劃</p>
                    </div>
                )}

                {/* List */}
                <div className="relative pb-10 space-y-6">
                    {currentDay.items.map((item, index) => (
                        <ItemCard 
                            key={item.id} 
                            item={item} 
                            isLast={index === currentDay.items.length - 1} 
                            onDelete={() => handleDeleteItem(item.id)}
                        />
                    ))}
                </div>
             </div>
        ) : (
            <ResourcesPage 
                tripData={tripData} 
                setTripData={setTripData} 
                itinerary={itinerary} 
                activeSubTab={activeTab}
            />
        )}
      </main>

      {/* Floating Action Button */}
      {activeTab === 'itinerary' && (
        <div className="fixed bottom-28 left-0 right-0 z-40 flex justify-center pointer-events-none">
            <button 
                onClick={() => setIsModalOpen(true)}
                className="pointer-events-auto bg-sumi hover:bg-black text-white rounded-full p-1.5 pl-1.5 pr-6 shadow-2xl flex items-center gap-3 group transition-transform hover:scale-105 active:scale-95"
            >
                <div className="bg-white/20 p-3 rounded-full">
                    <PlusIcon className="w-5 h-5" />
                </div>
                <span className="font-bold tracking-widest text-xs">新增行程</span>
            </button>
        </div>
      )}

      {/* Glass Bottom Navigation */}
      <div className="fixed bottom-6 left-6 right-6 max-w-[calc(100%-3rem)] mx-auto bg-white/90 backdrop-blur-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-3xl p-2 z-50 flex justify-around items-center">
         <button 
            onClick={() => setActiveTab('itinerary')}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl w-16 transition-all ${activeTab === 'itinerary' ? 'bg-stone-100 scale-105' : 'hover:bg-stone-50'}`}
         >
            <ListIcon className={`w-5 h-5 transition-colors ${activeTab === 'itinerary' ? 'text-ocean stroke-[2.5px]' : 'text-stone-300'}`} />
         </button>
         <button 
            onClick={() => setActiveTab('info')}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl w-16 transition-all ${activeTab === 'info' ? 'bg-stone-100 scale-105' : 'hover:bg-stone-50'}`}
         >
            <InfoIcon className={`w-5 h-5 transition-colors ${activeTab === 'info' ? 'text-terracotta stroke-[2.5px]' : 'text-stone-300'}`} />
         </button>
         <button 
            onClick={() => setActiveTab('money')}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl w-16 transition-all ${activeTab === 'money' ? 'bg-stone-100 scale-105' : 'hover:bg-stone-50'}`}
         >
            <DollarIcon className={`w-5 h-5 transition-colors ${activeTab === 'money' ? 'text-wasabi stroke-[2.5px]' : 'text-stone-300'}`} />
         </button>
         <button 
            onClick={() => setActiveTab('shopping')}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl w-16 transition-all ${activeTab === 'shopping' ? 'bg-stone-100 scale-105' : 'hover:bg-stone-50'}`}
         >
            <ShoppingBagIcon className={`w-5 h-5 transition-colors ${activeTab === 'shopping' ? 'text-coral stroke-[2.5px]' : 'text-stone-300'}`} />
         </button>
      </div>

      <AddItemModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddItem}
        date={activeDate}
      />

      <SyncModal 
        isOpen={isSyncModalOpen} 
        onClose={() => setIsSyncModalOpen(false)} 
        onImport={handleImportData}
        itinerary={itinerary}
        tripData={tripData}
      />
    </div>
  );
}
