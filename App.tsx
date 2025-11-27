
import React, { useState, useEffect } from 'react';
import { DATES, DaySchedule, ItemType, ItineraryState, TripData, ShoppingCategory } from './types';
import { ItemCard, AddItemModal } from './components/ItineraryComponents';
import { ResourcesPage } from './components/ResourcesPage';
import { PlusIcon, CloudSunIcon, MapPinIcon, ListIcon, InfoIcon, DollarIcon, ShoppingBagIcon, EditIcon } from './components/Icons';

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
    appTitle: "2026 OKA探險隊",
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

export default function App() {
  const [activeDate, setActiveDate] = useState<string>(DATES[0].date);
  const [itinerary, setItinerary] = useState<ItineraryState>(INITIAL_ITINERARY);
  const [tripData, setTripData] = useState<TripData>(INITIAL_TRIP_DATA);
  const [activeTab, setActiveTab] = useState<Tab>('itinerary');
  const [isModalOpen, setIsModalOpen] = useState(false);
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


  const currentDay = itinerary[activeDate];

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
      <header className="sticky top-0 z-30 bg-[#fcfbf9]/90 backdrop-blur-xl pt-20 pb-4 px-7 transition-all">
        <div className="flex justify-between items-start mb-6">
            <div className="flex-1 pr-4">
                <p className="text-ocean text-[10px] font-bold tracking-[0.25em] mb-2 uppercase">Okinawa Trip</p>
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
            
            {/* Weather Pill */}
            {activeTab === 'itinerary' && (
                <div className="flex flex-col items-end pl-2 pt-1">
                    <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-stone-100 shadow-sm">
                        <CloudSunIcon className="w-4 h-4 text-terracotta" />
                        <span className="text-xs font-bold text-stone-600 tracking-wide">{(currentDay?.generalWeather || "晴天").split(',')[0]}</span>
                    </div>
                </div>
            )}
        </div>

        {/* Date Grid Tabs (5 Columns) */}
        {activeTab === 'itinerary' && (
            <div className="grid grid-cols-5 gap-2 pb-4 pt-4 w-full">
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
    </div>
  );
}
