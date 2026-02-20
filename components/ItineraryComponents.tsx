import React, { useState, useEffect } from 'react';
import { ItineraryItem, ItemType } from '../types';
import { CarIcon, UtensilsIcon, CameraIcon, BedIcon, NavigationIcon, MapPinIcon, CloudSunIcon, TrashIcon, CheckIcon, EditIcon } from './Icons';
import { suggestItem, getLocationInsight } from '../services/geminiService';

// --- Helper Functions ---
const getTypeStyles = (type: ItemType) => {
  switch (type) {
    case ItemType.FOOD: 
        return {
            bg: 'bg-white',
            accent: 'bg-terracotta',
            text: 'text-terracotta',
            border: 'border-terracotta/20',
            label: '美食'
        };
    case ItemType.TRANSPORT: 
        return {
            bg: 'bg-white', 
            accent: 'bg-stone-500',
            text: 'text-stone-500',
            border: 'border-stone-200',
            label: '交通'
        };
    case ItemType.HOTEL: 
        return {
            bg: 'bg-white',
            accent: 'bg-slate-jp',
            text: 'text-slate-jp',
            border: 'border-slate-jp/20',
            label: '住宿'
        };
    case ItemType.ACTIVITY: default: 
        return {
            bg: 'bg-white',
            accent: 'bg-ocean',
            text: 'text-ocean',
            border: 'border-ocean/20',
            label: '景點'
        };
  }
};

const getTypeIcon = (type: ItemType) => {
  switch (type) {
    case ItemType.FOOD: return <UtensilsIcon className="w-3.5 h-3.5" />;
    case ItemType.TRANSPORT: return <CarIcon className="w-3.5 h-3.5" />;
    case ItemType.HOTEL: return <BedIcon className="w-3.5 h-3.5" />;
    case ItemType.ACTIVITY: default: return <CameraIcon className="w-3.5 h-3.5" />;
  }
};

// --- Components ---

interface ItemCardProps {
  item: ItineraryItem;
  isLast?: boolean;
  onDelete: () => void;
  onEdit: () => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, isLast, onDelete, onEdit }) => {
  const styles = getTypeStyles(item.type);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const handleNavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Prioritize address for navigation, fallback to location name
    const query = encodeURIComponent(item.address || item.location);
    // Use Google Maps with navigation mode
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}&travelmode=driving`, '_blank');
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDelete) {
        onDelete();
        setConfirmDelete(false);
    } else {
        setConfirmDelete(true);
        setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit();
  }

  return (
    <div className="relative pl-2 group">
      {/* Timeline Time & Dot - Centered Layout */}
      <div className="absolute left-0 top-0 bottom-0 w-14 flex flex-col items-center pt-2">
         <span className="text-[11px] font-mono font-bold text-stone-400 mb-3 tracking-wider">{item.time}</span>
         
         {/* Timeline Line (Inside the centered column) */}
         {!isLast && (
            <div className="absolute top-10 bottom-[-24px] w-[1px] bg-stone-200 left-1/2 -translate-x-1/2"></div>
         )}
         
         <div className={`w-2.5 h-2.5 rounded-full border-[1.5px] bg-washi ${styles.text.replace('text-', 'border-')} z-10`}></div>
      </div>

      <div className={`ml-14 rounded-2xl p-5 shadow-soft border ${styles.border} bg-white relative overflow-hidden transition-all active:scale-[0.99]`}>
        
        {/* Actions Buttons */}
        <div className="absolute top-3 right-3 flex gap-1 z-20">
            <button 
                onClick={handleEditClick}
                className="p-2 rounded-full bg-transparent text-stone-300 hover:bg-stone-50 transition-all"
            >
                <EditIcon className="w-4 h-4" />
            </button>
            <button 
                onClick={handleDeleteClick}
                className={`p-2 rounded-full transition-all ${confirmDelete ? 'bg-coral text-white shadow-md scale-110' : 'bg-transparent text-stone-300 hover:bg-stone-50'}`}
            >
                <TrashIcon className="w-4 h-4" />
            </button>
        </div>

        {/* Type Label & Weather (Top Row) */}
        <div className="flex justify-between items-start mb-3 pr-16">
             <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-50/50 border ${styles.border}`}>
                 <span className={`${styles.text}`}>{getTypeIcon(item.type)}</span>
                 <span className={`text-[10px] font-black tracking-widest ${styles.text} opacity-90`}>
                    {styles.label}
                 </span>
             </div>

             {item.weatherForecast && (
                <div className="flex items-center gap-1.5 opacity-60 mr-2 absolute top-4 right-20">
                     <CloudSunIcon className="w-4 h-4 text-stone-400" />
                     {/* FIX: Add safe check for split to satisfy TS */}
                     <span className="text-[10px] font-medium text-stone-500 tracking-wide">{(item.weatherForecast || '').split(',')[0]}</span>
                </div>
             )}
        </div>

        <h3 className="text-lg font-extrabold text-sumi mb-1 leading-snug tracking-tight pr-4">{item.title}</h3>
        
        <div className="flex flex-col text-xs mb-4 tracking-wide">
          {(item.address || (item.location && item.location !== item.title)) && (
            <div className="flex items-center text-stone-500 font-bold">
              <MapPinIcon className="w-3 h-3 mr-1.5 opacity-70 flex-shrink-0" />
              <span className="truncate">{item.address || item.location}</span>
            </div>
          )}
        </div>

        {item.notes && (
          <div className="text-stone-500 text-xs mb-5 font-medium leading-relaxed whitespace-pre-line border-l-2 border-stone-100 pl-3">
            {item.notes}
          </div>
        )}

        {/* Action Button: Drive / Navigate */}
        <button 
          onClick={handleNavClick}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black tracking-widest transition-colors 
            ${item.type === ItemType.TRANSPORT ? 'bg-ocean text-white shadow-lg shadow-ocean/20' : 'bg-stone-50 text-stone-500 border border-stone-100 hover:bg-stone-100'}
          `}
        >
          <NavigationIcon className="w-3.5 h-3.5" />
          {item.type === ItemType.TRANSPORT ? '開始導航' : '導航至此'}
        </button>
      </div>
    </div>
  );
};


interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<ItineraryItem, 'id'>) => void;
  date: string;
  initialData?: ItineraryItem | null;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onAdd, date, initialData }) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState<ItemType>(ItemType.ACTIVITY);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hotelAction, setHotelAction] = useState<'Check-in' | 'Check-out' | null>(null);

  useEffect(() => {
      if (initialData) {
          setTime(initialData.time);
          setLocation(initialData.location);
          setAddress(initialData.address || '');
          setType(initialData.type);
          
          if (initialData.type === ItemType.HOTEL) {
              if (initialData.title.includes('Check-in')) setHotelAction('Check-in');
              else if (initialData.title.includes('Check-out')) setHotelAction('Check-out');
              setTitle(initialData.notes || '');
          } else {
              setTitle(initialData.notes || ''); // In non-hotel, user puts notes in 'title' input in UI
          }
      } else {
          setTime('09:00');
          setLocation('');
          setAddress('');
          setTitle('');
          setType(ItemType.ACTIVITY);
          setHotelAction(null);
      }
  }, [initialData, isOpen]);

  const isHotel = type === ItemType.HOTEL;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    let displayTitle = title;
    
    if (isHotel) {
        if (hotelAction) {
          displayTitle = `住宿 ${hotelAction}`;
        } else {
          displayTitle = "住宿";
        }
    }

    let finalTitle = displayTitle;
    let finalNote = "";

    // If not hotel, the Title input serves as Note/Description, and Location Name serves as Title
    if (!isHotel) {
        if (!location) {
            finalTitle = "自由活動";
        } else {
            finalTitle = location; // Title shows location name
        }
        finalNote = title; // Notes are what user typed in 'title' box
    } else {
        finalNote = title; // For hotel, note is note
    }

    // Only fetch AI insight if adding new or if location changed drastically (simplified to always if not editing purely text)
    // To save API, maybe skip if editing? Let's keep it for now but be mindful.
    let weather = initialData?.weatherForecast || '';
    
    if (!initialData || (initialData && initialData.location !== location)) {
        try {
            const insight = await getLocationInsight(location, date, type);
            // Append tip to note if it's new
            if (!initialData) {
                 finalNote = finalNote ? `${finalNote}\n💡 ${insight.tip}` : `💡 ${insight.tip}`;
            }
            weather = insight.weather;
        } catch(err) {
            console.warn("Failed to get insight", err);
        }
    }

    onAdd({
      time,
      title: finalTitle,
      location, // Display Name
      address, // Navigation Address
      type,
      notes: finalNote, 
      weatherForecast: weather
    });
    
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-[#fcfbf9] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-[fadeIn_0.3s_ease-out] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-black text-sumi tracking-wide">{initialData ? '編輯行程' : '新增行程'}</h2>
          <button onClick={onClose} className="p-2 bg-stone-100 rounded-full text-stone-500 hover:bg-stone-200">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection */}
          <div className="grid grid-cols-4 gap-2">
             {Object.values(ItemType).map((t) => {
                const isSelected = type === t;
                const styles = getTypeStyles(t);
                return (
               <button
                 key={t}
                 type="button"
                 onClick={() => { setType(t); if(t!==ItemType.HOTEL) setHotelAction(null); }}
                 className={`flex flex-col items-center justify-center gap-1 py-3 rounded-2xl text-[10px] font-bold transition-all border ${
                   isSelected
                   ? `bg-white border-${styles.text.split('-')[1]} text-${styles.text.split('-')[1]} shadow-md ring-1 ring-${styles.text.split('-')[1]}` 
                   : 'bg-stone-50 border-transparent text-stone-400 hover:bg-stone-100'
                 }`}
               >
                 {getTypeIcon(t)}
                 <span className="capitalize tracking-wider">{styles.label}</span>
               </button>
             )})}
          </div>

          {/* Time Input */}
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                時間
            </label>
            <input 
              type="time" 
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-white px-4 py-3 rounded-xl text-xl font-mono font-medium outline-none shadow-sm transition-all"
            />
          </div>

          {/* Hotel Specific Actions */}
          {isHotel && (
             <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => setHotelAction('Check-in')}
                    className={`py-3 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-2 ${hotelAction === 'Check-in' ? 'bg-slate-700 text-white border-slate-700 shadow-lg' : 'bg-white text-slate-500 border-stone-200'}`}
                >
                    {hotelAction === 'Check-in' && <CheckIcon className="w-3.5 h-3.5" />}
                    Check-in
                </button>
                <button
                    type="button"
                    onClick={() => setHotelAction('Check-out')}
                    className={`py-3 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-2 ${hotelAction === 'Check-out' ? 'bg-slate-700 text-white border-slate-700 shadow-lg' : 'bg-white text-slate-500 border-stone-200'}`}
                >
                    {hotelAction === 'Check-out' && <CheckIcon className="w-3.5 h-3.5" />}
                    Check-out
                </button>
             </div>
          )}

          {/* Location Input (Split into Name and Address) */}
           <div className="space-y-3">
            <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                    {isHotel ? '飯店名稱' : '地點名稱 (顯示用)'}
                </label>
                <div className="relative">
                    <input 
                    type="text" 
                    placeholder={isHotel ? "例如：Orion Hotel" : "例如：美國村"}
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-white px-4 py-3 rounded-xl text-sm font-bold text-sumi outline-none shadow-sm placeholder:font-normal placeholder:text-stone-300 transition-all"
                    />
                </div>
            </div>
            <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                    地址 (導航用)
                </label>
                <div className="relative">
                    <MapPinIcon className="absolute left-4 top-3.5 w-4 h-4 text-stone-300" />
                    <input 
                    type="text" 
                    placeholder="貼上 Google Maps 地址..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white pl-10 pr-4 py-3 rounded-xl text-xs font-medium text-stone-600 outline-none shadow-sm placeholder:font-normal placeholder:text-stone-300 transition-all"
                    />
                </div>
            </div>
          </div>

          {/* Remark Input */}
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                備註 (選填)
            </label>
            <div className="relative">
                <textarea 
                placeholder={isHotel ? "例如：訂房代號 #12345" : (type === ItemType.FOOD ? "例如：預約 18:00" : "例如：記得帶毛巾")}
                value={title} // We use 'title' state to hold notes in UI for generic items
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white px-4 py-3 rounded-xl text-sm outline-none shadow-sm placeholder:text-stone-300 transition-all resize-none"
                rows={3}
                />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isProcessing}
            className="w-full bg-sumi hover:bg-black text-white font-bold py-4 rounded-2xl mt-4 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg transition-transform active:scale-[0.98] tracking-widest text-sm"
          >
            {isProcessing ? (
                <>
                 <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                 處理中...
                </>
            ) : (
                initialData ? '確認更新' : '確認加入'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};