

import React, { useState, useEffect, useRef } from 'react';
import { TripData, FlightInfo, ItineraryState, ItemType, DaySchedule, ItineraryItem, ShoppingCategory, ShoppingColorType, ShoppingItem, Expense, ShoppingLocation, Contact } from '../types';
import { PlaneIcon, WalletIcon, PhoneIcon, BedIcon, ShoppingBagIcon, PlusIcon, CheckIcon, CalculatorIcon, ExchangeIcon, EditIcon, ZapIcon, ArrowLeftIcon, TrashIcon, PhotoIcon, UsersIcon, PaperPlaneIcon, MapPinIcon, NavigationIcon, CameraIcon, SimplePlaneIcon, PlaneTakeoffIcon, GlobeIcon, GamepadIcon, DollarIcon, CreditCardIcon, BanknoteIcon } from './Icons';

interface ResourcesPageProps {
  tripData: TripData;
  setTripData: (data: TripData) => void;
  itinerary: ItineraryState;
  activeSubTab: 'info' | 'money' | 'shopping';
}

// --- Helper Functions ---
const getShoppingColor = (color: ShoppingColorType) => {
    // Fixed color: Ocean (Southern Group Flight Info style)
    return { bg: 'bg-ocean', text: 'text-ocean', light: 'bg-cyan-50/50', border: 'border-ocean/10', hex: '#2c7a7b' };
}

const isPersonalExpense = (ex: Expense) => {
    return ex.beneficiaries && ex.beneficiaries.length === 1 && ex.beneficiaries[0] === ex.payer;
};

// --- Shared Components ---

const DeleteButton = ({ onDelete, className = "", iconSize = "w-4 h-4" }: { onDelete: () => void, className?: string, iconSize?: string }) => {
    const [confirm, setConfirm] = useState(false);
    
    useEffect(() => {
        if(confirm) {
            const timer = setTimeout(() => setConfirm(false), 3000); 
            return () => clearTimeout(timer);
        }
    }, [confirm]);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        e.preventDefault();
        if (confirm) {
            onDelete();
            setConfirm(false);
        } else {
            setConfirm(true);
        }
    };

    return (
        <button 
            type="button"
            onClick={handleClick} 
            className={`${className} transition-all duration-200 flex items-center justify-center ${confirm ? 'bg-red-500 text-white ring-2 ring-red-100 shadow-md scale-110' : ''}`}
        >
            <TrashIcon className={iconSize} />
        </button>
    )
}

const SecureCallButton = ({ number, display, className = "" }: { number: string, display: string, className?: string }) => {
    const [confirm, setConfirm] = useState(false);

    useEffect(() => {
        if (confirm) {
            const timer = setTimeout(() => setConfirm(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [confirm]);

    const handleCall = () => {
        if (confirm) {
            window.location.href = `tel:${number}`;
            setConfirm(false);
        } else {
            setConfirm(true);
        }
    };

    return (
        <button
            type="button"
            onClick={handleCall}
            className={`transition-all duration-300 flex items-center gap-3 group ${className} ${confirm ? 'bg-rose-900 !text-white px-6 py-2 rounded-full shadow-lg justify-center w-full' : ''}`}
        >
            {confirm ? (
                <span className="text-lg font-black tracking-widest flex items-center gap-2 !text-white">
                    <PhoneIcon className="w-5 h-5 fill-current" />
                    確認撥打?
                </span>
            ) : (
                <>
                    <span className="tracking-tight">{display}</span>
                    <div className="bg-rose-50 p-2 rounded-full group-hover:bg-rose-100 transition-colors">
                        <PhoneIcon className="w-4 h-4 text-rose-900" />
                    </div>
                </>
            )}
        </button>
    );
};

// --- Flight Card Component ---
const FlightGroupCard = ({ 
    title, 
    outbound, 
    inbound, 
    onSave,
    colorClass,
    originAirport
}: { 
    title: string, 
    outbound: FlightInfo, 
    inbound: FlightInfo, 
    onSave: (out: FlightInfo, inb: FlightInfo) => void,
    colorClass: string,
    originAirport: string
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localOut, setLocalOut] = useState<FlightInfo>(outbound);
    const [localIn, setLocalIn] = useState<FlightInfo>(inbound);
    const [savedId, setSavedId] = useState<string | null>(null);

    useEffect(() => {
        setLocalOut(outbound);
        setLocalIn(inbound);
    }, [outbound, inbound]);

    const handleSave = () => {
        onSave(localOut, localIn);
        setIsEditing(false);
    };

    const handleQuickSave = (field: string) => {
        setSavedId(field);
        setTimeout(() => setSavedId(null), 1500);
    }

    const handleChange = (leg: 'out' | 'in', field: keyof FlightInfo, val: string) => {
        let finalVal = val;
        if (field === 'flightNumber') {
            finalVal = val.toUpperCase();
        }
        if (leg === 'out') {
            setLocalOut(prev => ({ ...prev, [field]: finalVal }));
        } else {
            setLocalIn(prev => ({ ...prev, [field]: finalVal }));
        }
    };

    const renderFlightVisual = (leg: 'out' | 'in', from: string, to: string, info: FlightInfo) => (
        <div className="flex flex-col w-full">
            <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-black text-white px-2 py-0.5 rounded-sm tracking-wider ${leg === 'out' ? 'bg-stone-400' : 'bg-stone-400'}`}>
                    {leg === 'out' ? '去程 OUTBOUND' : '回程 INBOUND'}
                </span>
                <span className="font-mono font-black text-sumi text-xs">{info.date}</span>
            </div>

            <div className="flex items-center justify-between w-full mb-2">
                <div className="text-2xl font-black text-stone-700 tracking-tighter w-14 text-center">{from}</div>
                
                <div className="flex-1 flex items-center justify-center px-2 relative h-8">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-stone-300"></div>
                    <div className="relative bg-white px-2 z-10">
                            <SimplePlaneIcon className="w-5 h-5 text-stone-400" />
                    </div>
                </div>

                <div className={`text-2xl font-black ${colorClass.replace('bg-', 'text-')} tracking-tighter w-14 text-center`}>{to}</div>
            </div>

            <div className="flex justify-between w-full text-[10px] text-stone-400 font-bold px-1">
                <div className="w-14 text-center flex flex-col">
                    <span className="text-sm text-sumi font-mono font-black">{info.time || '--:--'}</span>
                    <span className="text-[9px] text-stone-300">DEP</span>
                </div>
                <div className="flex-1 text-center pt-1">
                    <span className="text-[10px] text-stone-300 font-bold tracking-widest">{info.flightNumber || 'FLIGHT NO.'}</span>
                </div>
                <div className="w-14 text-center flex flex-col">
                    <span className="text-sm text-sumi font-mono font-black">{info.arrivalTime || '--:--'}</span>
                    <span className="text-[9px] text-stone-300">ARR</span>
                </div>
            </div>
        </div>
    );

    if (!isEditing) {
        return (
            <div className="bg-white rounded-2xl shadow-soft border border-stone-100 overflow-hidden relative mb-6">
                <div className={`h-1.5 w-full ${colorClass} opacity-80`}></div>
                <div className="p-5">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className={`text-[10px] font-black tracking-[0.2em] uppercase ${colorClass.replace('bg-', 'text-')}`}>{title}</h3>
                        <button onClick={() => setIsEditing(true)} className="text-stone-300 hover:text-stone-500 transition-colors">
                            <EditIcon className="w-4 h-4" />
                        </button>
                     </div>
                     
                     <div className="space-y-6">
                        {/* Outbound Row */}
                        {renderFlightVisual('out', originAirport, 'OKA', localOut)}
                        
                        {/* Divider */}
                        <div className="w-full h-[1px] bg-stone-100 dashed"></div>

                        {/* Inbound Row */}
                        {renderFlightVisual('in', 'OKA', originAirport, localIn)}
                     </div>
                </div>
            </div>
        )
    }

    const renderTimeInput = (leg: 'out' | 'in', label: string, field: 'time' | 'arrivalTime') => {
        const id = `${leg}-${field}`;
        const val = leg === 'out' ? localOut[field] : localIn[field];
        
        return (
             <div className="flex flex-col gap-1.5 w-full">
                 <label className="text-[10px] font-bold text-stone-400 block">{label}</label>
                 <div className="flex gap-2 items-center">
                    <input 
                        type="time" 
                        value={val || ''} 
                        onChange={e => handleChange(leg, field, e.target.value)} 
                        className="flex-1 bg-stone-50 p-2 rounded-xl text-lg font-mono outline-none focus:ring-1 focus:ring-stone-200 h-12 appearance-none" 
                    />
                    <button 
                        type="button" 
                        onClick={() => handleQuickSave(id)} 
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${savedId === id ? 'bg-green-100 text-green-600' : 'bg-stone-50 text-stone-300 hover:bg-stone-100'}`}
                    >
                        <CheckIcon className="w-5 h-5" />
                    </button>
                 </div>
            </div>
        )
    }

    return (
        <div className={`bg-white p-6 rounded-2xl shadow-lg border border-stone-100 mb-6`}>
            <div className="flex justify-between items-center mb-6">
                <span className={`text-[10px] font-bold text-white px-2 py-1 rounded-md tracking-wider ${colorClass}`}>EDIT MODE</span>
                <button onClick={handleSave} className="text-xs font-bold text-white bg-sumi px-4 py-2 rounded-full hover:bg-black transition-all shadow-lg">
                    完成編輯
                </button>
            </div>
            <div className="space-y-8">
                {/* Outbound Edit */}
                <div className="space-y-6">
                    <p className="text-xs font-bold text-stone-400 border-b border-stone-100 pb-2">去程 ({originAirport} -&gt; OKA)</p>
                    <input type="date" value={localOut.date} onChange={e => handleChange('out', 'date', e.target.value)} className="w-full bg-stone-50 p-4 rounded-xl text-base outline-none focus:ring-1 focus:ring-stone-200" />
                    <input type="text" placeholder="航班號" value={localOut.flightNumber} onChange={e => handleChange('out', 'flightNumber', e.target.value)} className="w-full bg-stone-50 p-4 rounded-xl text-base font-bold uppercase outline-none focus:ring-1 focus:ring-stone-200" />
                    
                    <div className="flex flex-col gap-4 pb-2">
                        {renderTimeInput('out', '起飛時間', 'time')}
                        {renderTimeInput('out', '抵達時間', 'arrivalTime')}
                    </div>
                </div>

                {/* Inbound Edit */}
                <div className="space-y-6">
                    <p className="text-xs font-bold text-stone-400 border-b border-stone-100 pb-2">回程 (OKA -&gt; {originAirport})</p>
                    <input type="date" value={localIn.date} onChange={e => handleChange('in', 'date', e.target.value)} className="w-full bg-stone-50 p-4 rounded-xl text-base outline-none focus:ring-1 focus:ring-stone-200" />
                    <input type="text" placeholder="航班號" value={localIn.flightNumber} onChange={e => handleChange('in', 'flightNumber', e.target.value)} className="w-full bg-stone-50 p-4 rounded-xl text-base font-bold uppercase outline-none focus:ring-1 focus:ring-stone-200" />
                    
                     <div className="flex flex-col gap-4 pb-2">
                        {renderTimeInput('in', '起飛時間', 'time')}
                        {renderTimeInput('in', '抵達時間', 'arrivalTime')}
                    </div>
                </div>
            </div>
        </div>
    );
}

const InfoSection = ({ tripData, setTripData, itinerary }: { tripData: TripData, setTripData: (d: TripData) => void, itinerary: ItineraryState }) => {
    const [contactName, setContactName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactAvatar, setContactAvatar] = useState<string | undefined>(undefined);
    const [editingContactId, setEditingContactId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const contactFormRef = useRef<HTMLFormElement>(null);

    const updateFlights = (group: 'north' | 'south', out: FlightInfo, inb: FlightInfo) => {
        setTripData({
            ...tripData,
            flights: {
                ...tripData.flights,
                [group]: { outbound: out, inbound: inb }
            }
        });
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_SIZE = 250; 
                    let width = img.width;
                    let height = img.height;
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    setContactAvatar(canvas.toDataURL('image/jpeg', 0.7));
                }
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    const handleSaveContact = (e: React.FormEvent) => {
        e.preventDefault();
        if(!contactName.trim()) return;

        if (editingContactId) {
             setTripData({
                ...tripData,
                contacts: tripData.contacts.map(c => c.id === editingContactId ? { 
                    ...c, 
                    name: contactName, 
                    phone: contactPhone,
                    avatar: contactAvatar
                } : c)
            });
            setEditingContactId(null);
        } else {
            setTripData({
                ...tripData,
                contacts: [...tripData.contacts, { 
                    id: Date.now().toString(), 
                    name: contactName, 
                    phone: contactPhone,
                    avatar: contactAvatar
                }]
            });
        }
        setContactName('');
        setContactPhone('');
        setContactAvatar(undefined);
    }

    const handleDeleteContact = (id: string) => {
        setTripData({
            ...tripData,
            contacts: tripData.contacts.filter(c => c.id !== id)
        })
    }

    const handleEditContact = (contact: Contact) => {
        setContactName(contact.name);
        setContactPhone(contact.phone);
        setContactAvatar(contact.avatar);
        setEditingContactId(contact.id);
        
        if (contactFormRef.current) {
            contactFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    const hotelList = Object.values(itinerary)
    .flatMap((day: DaySchedule) => day.items.filter((item: ItineraryItem) => item.type === ItemType.HOTEL))
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    const renderAvatar = (avatarStr?: string, name?: string) => {
        if (avatarStr) {
             return <img src={avatarStr} alt="avatar" className="w-full h-full object-cover bg-stone-50" />;
        }
        return <span className="text-stone-400 font-bold text-lg">{name ? name[0] : ''}</span>;
    }

    return (
        <div className="space-y-12 pb-24 px-7">
            {/* Flights */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-ocean/10 flex items-center justify-center">
                        <PaperPlaneIcon className="w-4 h-4 text-ocean" />
                    </div>
                    <h2 className="text-lg font-black text-sumi">航班資訊</h2>
                </div>
                
                <FlightGroupCard 
                    title="南部鄉親 (Southern Group)" 
                    outbound={tripData.flights.south.outbound} 
                    inbound={tripData.flights.south.inbound} 
                    onSave={(o, i) => updateFlights('south', o, i)}
                    colorClass="bg-ocean" 
                    originAirport="RMQ"
                />

                <FlightGroupCard 
                    title="北部鄉親 (Northern Group)" 
                    outbound={tripData.flights.north.outbound} 
                    inbound={tripData.flights.north.inbound} 
                    onSave={(o, i) => updateFlights('north', o, i)}
                    colorClass="bg-terracotta"
                    originAirport="TPE"
                />
            </section>

             {/* Accomodation */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <BedIcon className="w-4 h-4 text-slate-500" />
                    </div>
                    <h2 className="text-lg font-black text-sumi">住宿清單</h2>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-soft">
                    {hotelList.length === 0 ? (
                        <p className="text-center text-stone-300 text-xs py-2">請於行程頁面加入住宿</p>
                    ) : (
                        <div className="space-y-6">
                            {hotelList.map((hotel, idx) => (
                                <div key={idx} className="flex gap-4 items-start pb-6 border-b border-dashed border-stone-100 last:border-0 last:pb-0">
                                    <div className="w-16 pt-0.5">
                                         <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                                            {(Object.values(itinerary) as DaySchedule[]).find(d => d.items.includes(hotel))?.date.slice(5)}
                                         </span>
                                        <span className="block text-xs font-mono font-bold text-sumi mt-1">{hotel.time}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-extrabold text-sumi text-sm">{hotel.location}</h4>
                                        <p className="text-xs text-stone-500 mt-1 whitespace-pre-line leading-relaxed">{hotel.notes || hotel.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Emergency */}
            <section>
                 <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center">
                        <PhoneIcon className="w-4 h-4 text-rose-900" />
                    </div>
                    <h2 className="text-lg font-black text-sumi">緊急聯絡</h2>
                </div>
                
                <div className="space-y-4">
                     {/* 110 & 119 */}
                     <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 flex justify-around items-center">
                         <div className="text-center">
                            <a href="tel:110" className="block text-3xl font-black text-rose-900 tracking-tighter leading-none mb-1 hover:opacity-80 transition-opacity">110</a>
                            <span className="text-xs font-bold text-stone-400 tracking-widest">警察署</span>
                         </div>
                         <div className="w-[1px] h-10 bg-stone-100"></div>
                         <div className="text-center">
                            <a href="tel:119" className="block text-3xl font-black text-rose-900 tracking-tighter leading-none mb-1 hover:opacity-80 transition-opacity">119</a>
                            <span className="text-xs font-bold text-stone-400 tracking-widest">救護/火警</span>
                         </div>
                     </div>

                     {/* Visitor Hotline */}
                     <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4">
                         <p className="text-sm font-black text-sumi mb-1">訪日外國人 醫療&急難熱線</p>
                         <SecureCallButton 
                            number="05038162787" 
                            display="050-3816-2787" 
                            className="text-2xl font-black text-rose-900 block mb-2" 
                         />
                         <p className="text-[11px] text-stone-500 font-medium leading-relaxed whitespace-nowrap overflow-x-auto no-scrollbar opacity-80">
                             *24小時對應(中、英、韓)。生病受傷或發生事故時可撥打。
                         </p>
                     </div>

                     {/* Naha Office */}
                     <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 space-y-1">
                         <div>
                            <p className="text-sm font-black text-sumi mb-0.5">台北駐日經濟文化代表處那霸分處</p>
                            <SecureCallButton 
                                number="0988627008" 
                                display="098-862-7008" 
                                className="text-2xl font-black text-rose-900 block" 
                            />
                         </div>
                         
                         <div>
                             <p className="text-sm font-black text-sumi mb-0.5 mt-2">緊急時撥打</p>
                             <SecureCallButton 
                                number="08080560122" 
                                display="080-8056-0122" 
                                className="text-2xl font-black text-rose-900 block" 
                             />
                         </div>
                     </div>
                </div>
            </section>

            {/* Companions */}
            <section>
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-wasabi/10 flex items-center justify-center">
                        <UsersIcon className="w-4 h-4 text-wasabi" />
                    </div>
                    <h2 className="text-lg font-black text-sumi">旅伴資訊</h2>
                </div>
                
                <div className="space-y-3">
                     {tripData.contacts.map(contact => (
                        <div key={contact.id} className={`bg-white border p-3 rounded-2xl flex items-center justify-between shadow-sm transition-colors ${editingContactId === contact.id ? 'border-terracotta ring-1 ring-terracotta bg-orange-50/10' : 'border-stone-100'}`}>
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-12 h-12 rounded-full bg-stone-50 flex-shrink-0 flex items-center justify-center overflow-hidden border border-stone-100">
                                    {renderAvatar(contact.avatar, contact.name)}
                                </div>
                                <div className="flex flex-col flex-1 min-w-0 mr-2 space-y-0.5">
                                     <span className="text-sm font-bold text-sumi truncate">{contact.name}</span>
                                     <span className="text-xs font-mono text-stone-400 truncate">{contact.phone}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                {contact.phone && (
                                    <a href={`tel:${contact.phone}`} className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors">
                                        <PhoneIcon className="w-3.5 h-3.5" />
                                    </a>
                                )}
                                <button onClick={() => handleEditContact(contact)} className={`p-2 rounded-full hover:bg-stone-100 ${editingContactId === contact.id ? 'bg-terracotta text-white hover:bg-terracotta' : 'bg-stone-50 text-stone-400'}`}>
                                    <EditIcon className="w-3.5 h-3.5" />
                                </button>
                                <DeleteButton onDelete={() => handleDeleteContact(contact.id)} className="p-2 bg-stone-50 text-stone-400 rounded-full hover:bg-stone-100" iconSize="w-3.5 h-3.5" />
                            </div>
                        </div>
                     ))}
                     
                     <form ref={contactFormRef} onSubmit={handleSaveContact} className={`bg-stone-50 border border-stone-100 border-dashed rounded-2xl p-4 flex flex-col gap-3 transition-colors ${editingContactId ? 'bg-orange-50/50 border-orange-100' : ''}`}>
                         <p className={`text-xs font-bold ${editingContactId ? 'text-terracotta' : 'text-stone-400'}`}>
                            {editingContactId ? `正在編輯：${contactName}` : '新增旅伴'}
                         </p>
                         <div className="flex items-center gap-3">
                            <div className="relative">
                                <button 
                                    type="button" 
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all overflow-hidden ${contactAvatar ? 'border-transparent shadow-sm' : 'border-stone-200 bg-white text-stone-300 hover:bg-stone-100'}`}
                                >
                                    {contactAvatar ? (
                                        <img src={contactAvatar} className="w-full h-full object-cover" />
                                    ) : (
                                        <CameraIcon className="w-5 h-5 text-stone-300" />
                                    )}
                                </button>
                                
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                            </div>

                            <div className="flex-1 flex flex-col gap-2">
                                <input 
                                    type="text" 
                                    placeholder="姓名"
                                    value={contactName}
                                    onChange={e => setContactName(e.target.value)}
                                    className="bg-white rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-stone-200"
                                />
                                <input 
                                    type="tel" 
                                    placeholder="電話"
                                    value={contactPhone}
                                    onChange={e => setContactPhone(e.target.value)}
                                    className="bg-white rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-stone-200"
                                />
                            </div>
                         </div>
                         <div className="flex gap-2">
                             {editingContactId && <button type="button" onClick={() => { setEditingContactId(null); setContactName(''); setContactPhone(''); setContactAvatar(undefined); }} className="flex-1 bg-stone-200 text-stone-500 font-bold py-3 rounded-xl text-xs">取消</button>}
                             <button type="submit" disabled={!contactName.trim()} className="flex-1 bg-sumi text-white h-auto py-3 rounded-xl text-xs font-bold disabled:opacity-50 hover:bg-black transition-all">
                                 {editingContactId ? '更新資料' : '新增'}
                             </button>
                         </div>
                     </form>
                </div>
            </section>
        </div>
    );
};

const MoneySection = ({ tripData, setTripData }: { tripData: TripData, setTripData: (d: TripData) => void }) => {
    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [payer, setPayer] = useState('');
    const [calcJpy, setCalcJpy] = useState('');
    const [expenseType, setExpenseType] = useState<'SHARED' | 'PERSONAL'>('SHARED');
    
    // New fields
    const [newExpenseDate, setNewExpenseDate] = useState(new Date().toISOString().slice(0,10));
    const [newExpenseTime, setNewExpenseTime] = useState(new Date().toTimeString().slice(0,5));
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH');

    const [selectedBeneficiaries, setSelectedBeneficiaries] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<'SHARED' | 'PERSONAL'>('SHARED');
    const [selectedContact, setSelectedContact] = useState<string>('');
    const [showSettlement, setShowSettlement] = useState(false);

    const contactNames = tripData.contacts.map(c => c.name);

    useEffect(() => {
        if (contactNames.length > 0 && selectedBeneficiaries.length === 0) {
            setSelectedBeneficiaries(contactNames);
        }
    }, [tripData.contacts.length]);

    useEffect(() => {
        if (viewMode === 'PERSONAL' && !selectedContact && contactNames.length > 0) {
            setSelectedContact(contactNames[0]);
        }
    }, [viewMode, contactNames]);

    const handleAddExpense = (e: React.FormEvent) => {
        e.preventDefault();
        let beneficiaries = selectedBeneficiaries;
        if (expenseType === 'PERSONAL') beneficiaries = [payer];
        if(!amount || !desc || !payer || beneficiaries.length === 0) return;
        
        // Construct ISO string for sorting
        const dateTimeStr = `${newExpenseDate}T${newExpenseTime}:00`;

        setTripData({
            ...tripData,
            expenses: [...tripData.expenses, { 
                id: Date.now().toString(), 
                amount: parseInt(amount), 
                title: desc, 
                payer, 
                date: newExpenseDate,
                timestamp: dateTimeStr,
                beneficiaries: beneficiaries,
                paymentMethod: paymentMethod,
                exchangeRate: tripData.exchangeRate // Snapshot current rate
            }]
        });
        setAmount('');
        setDesc('');
        // Reset time to current
        const now = new Date();
        setNewExpenseDate(now.toISOString().slice(0,10));
        setNewExpenseTime(now.toTimeString().slice(0,5));
    };

    const toggleBeneficiary = (name: string) => {
        if (selectedBeneficiaries.includes(name)) setSelectedBeneficiaries(selectedBeneficiaries.filter(n => n !== name));
        else setSelectedBeneficiaries([...selectedBeneficiaries, name]);
    };

    const toggleAllBeneficiaries = () => {
        if (selectedBeneficiaries.length === contactNames.length) setSelectedBeneficiaries([]);
        else setSelectedBeneficiaries(contactNames);
    };

    const calculateSettlement = () => {
        const settlement: Record<string, { paid: number, share: number, balance: number }> = {};
        contactNames.forEach(name => { settlement[name] = { paid: 0, share: 0, balance: 0 }; });

        tripData.expenses.forEach(ex => {
            if (isPersonalExpense(ex)) return;
            if (settlement[ex.payer]) settlement[ex.payer].paid += ex.amount;
            const benes = (ex.beneficiaries && ex.beneficiaries.length > 0) ? ex.beneficiaries : contactNames;
            if (benes.length > 0) {
                const shareAmount = ex.amount / benes.length;
                benes.forEach(bName => {
                    if (settlement[bName]) settlement[bName].share += shareAmount;
                });
            }
        });

        Object.keys(settlement).forEach(name => {
            settlement[name].balance = settlement[name].paid - settlement[name].share;
        });
        return settlement;
    };

    // Simplify Debt Logic (Greedy Algorithm)
    const calculateSimplifiedDebts = (balances: Record<string, { balance: number }>) => {
        let debtors: { name: string, amount: number }[] = [];
        let creditors: { name: string, amount: number }[] = [];

        Object.entries(balances).forEach(([name, data]) => {
            const bal = Math.round(data.balance); // Use integer rounding to avoid float issues
            if (bal < -1) debtors.push({ name, amount: -bal });
            else if (bal > 1) creditors.push({ name, amount: bal });
        });

        debtors.sort((a, b) => b.amount - a.amount);
        creditors.sort((a, b) => b.amount - a.amount);

        const transactions: { from: string, to: string, amount: number }[] = [];

        let i = 0; // debtors index
        let j = 0; // creditors index

        while (i < debtors.length && j < creditors.length) {
            const debtor = debtors[i];
            const creditor = creditors[j];
            const amount = Math.min(debtor.amount, creditor.amount);

            if (amount > 0) {
                transactions.push({ from: debtor.name, to: creditor.name, amount });
            }

            debtor.amount -= amount;
            creditor.amount -= amount;

            if (debtor.amount < 1) i++;
            if (creditor.amount < 1) j++;
        }

        return transactions;
    };

    const settlementData = calculateSettlement();
    const suggestedRepayments = calculateSimplifiedDebts(settlementData);
    const totalGroupSpend = tripData.expenses.filter(ex => !isPersonalExpense(ex)).reduce((acc, curr) => acc + curr.amount, 0);

    const filteredExpenses = tripData.expenses.filter(ex => {
        const isPersonal = isPersonalExpense(ex);
        if (viewMode === 'SHARED') return !isPersonal;
        if (viewMode === 'PERSONAL') {
             if (!selectedContact) return false;
             const benes = (ex.beneficiaries && ex.beneficiaries.length > 0) ? ex.beneficiaries : contactNames;
             return ex.payer === selectedContact || benes.includes(selectedContact);
        }
        return true;
    }).sort((a, b) => {
        // Sort by timestamp if available, else date
        const timeA = a.timestamp || a.date;
        const timeB = b.timestamp || b.date;
        return timeB.localeCompare(timeA); // Descending order
    });

    return (
        <div className="space-y-8 pb-20 px-7">
             {/* Currency Tool */}
             <section className="bg-sumi text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                
                <div className="flex items-center justify-between mb-6 relative z-10">
                     <div className="flex items-center gap-2">
                         <CalculatorIcon className="w-5 h-5 text-wasabi" />
                         <h2 className="font-black tracking-wide">匯率換算</h2>
                     </div>
                     <a 
                        href="https://www.google.com/finance/quote/JPY-TWD" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] bg-white/10 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-white/20 transition-colors text-wasabi font-bold"
                     >
                        <GlobeIcon className="w-3 h-3" />
                        查詢匯率
                     </a>
                </div>

                <div className="bg-white/10 rounded-2xl py-2 px-4 mb-6 relative z-10 flex items-center justify-center gap-3">
                     <span className="text-xs text-stone-400 font-bold uppercase tracking-wider pt-0.5">Rate (JPY/TWD)</span>
                     <span className="text-stone-400 font-bold text-lg pt-0.5 pb-0.5">×</span>
                     <input 
                        type="number" 
                        value={tripData.exchangeRate} 
                        onChange={(e) => setTripData({...tripData, exchangeRate: parseFloat(e.target.value)})}
                        className="w-24 bg-white/20 rounded-lg py-1 px-2 text-center border border-transparent focus:border-wasabi outline-none text-white font-bold text-xl h-10"
                     />
                </div>

                <div className="flex items-end gap-4 relative z-10">
                    <div className="flex-1">
                         <label className="text-[10px] text-stone-500 font-bold block mb-1">JPY</label>
                         <input 
                            type="number" 
                            value={calcJpy}
                            onChange={(e) => setCalcJpy(e.target.value)}
                            className="w-full bg-transparent text-3xl font-mono font-bold outline-none placeholder:text-stone-700"
                            placeholder="0"
                         />
                    </div>
                    <ExchangeIcon className="w-6 h-6 text-stone-600 mb-2" />
                    <div className="flex-1 text-right">
                        <label className="text-[10px] text-stone-500 font-bold block mb-1">TWD</label>
                        <span className="text-3xl font-mono font-bold text-wasabi">
                            {calcJpy ? Math.round(parseInt(calcJpy) * tripData.exchangeRate).toLocaleString() : '0'}
                        </span>
                    </div>
                </div>
             </section>

             {/* Settlement Dashboard */}
             <section className="bg-white rounded-3xl p-6 border border-stone-100 shadow-soft">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-black text-sumi">結算看板</h2>
                        <span className="text-[10px] font-mono text-stone-400 bg-stone-50 px-2 py-1 rounded">總公帳: ¥{totalGroupSpend.toLocaleString()}</span>
                    </div>
                    <button 
                        onClick={() => setShowSettlement(!showSettlement)} 
                        className="text-xs font-bold text-wasabi bg-wasabi/10 px-4 py-2 rounded-xl hover:bg-wasabi/20 transition-colors"
                    >
                        {showSettlement ? '收起明細' : '查看明細'}
                    </button>
                </div>
                
                {showSettlement && (
                    <div className="mt-6 animate-[fadeIn_0.2s_ease-out]">
                        {contactNames.length === 0 ? (
                            <p className="text-center text-xs text-stone-300 py-2">請先新增聯絡人</p>
                        ) : (
                            <div className="space-y-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-right whitespace-nowrap">
                                        <thead>
                                            <tr className="text-stone-400 border-b border-stone-50">
                                                <th className="pb-3 text-left font-bold pl-2">成員</th>
                                                <th className="pb-3 font-normal">先墊</th>
                                                <th className="pb-3 font-normal">應付</th>
                                                <th className="pb-3 font-bold text-sumi pr-2">結餘</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(settlementData).map(([name, data]) => (
                                                <tr key={name} className="border-b border-stone-50 last:border-0 hover:bg-stone-50 transition-colors">
                                                    <td className="py-3 text-left font-bold text-sumi pl-2">{name}</td>
                                                    <td className="py-3 text-stone-400">¥{data.paid.toLocaleString()}</td>
                                                    <td className="py-3 text-stone-400">¥{Math.round(data.share).toLocaleString()}</td>
                                                    <td className={`py-3 font-mono font-bold pr-2 ${data.balance >= 0 ? 'text-wasabi' : 'text-coral'}`}>
                                                        {data.balance > 0 ? '+' : ''}{Math.round(data.balance).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Suggested Repayments */}
                                <div>
                                    <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3 border-t border-stone-100 pt-4">最佳還款建議</h3>
                                    <div className="space-y-2">
                                        {suggestedRepayments.length === 0 ? (
                                            <p className="text-xs text-stone-300 text-center italic py-2">帳目已平，無需還款</p>
                                        ) : (
                                            suggestedRepayments.map((item, idx) => (
                                                <div key={idx} className="bg-stone-50 p-3 rounded-xl flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sumi text-xs">{item.from}</span>
                                                        <ArrowLeftIcon className="w-3 h-3 text-stone-300 rotate-180" />
                                                        <span className="font-bold text-sumi text-xs">{item.to}</span>
                                                    </div>
                                                    <span className="font-mono font-black text-wasabi text-sm">¥{item.amount.toLocaleString()}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
             </section>

             {/* Expenses Entry & List */}
             <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-wasabi/10 flex items-center justify-center">
                        <WalletIcon className="w-4 h-4 text-wasabi" />
                    </div>
                    <h2 className="text-lg font-black text-sumi">新增款項</h2>
                </div>
                
                <form onSubmit={handleAddExpense} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-soft mb-10">
                    <div className="flex bg-stone-50 p-1 rounded-xl mb-6">
                        <button
                            type="button"
                            onClick={() => setExpenseType('SHARED')}
                            className={`flex-1 text-xs font-bold py-2.5 rounded-lg transition-all ${expenseType === 'SHARED' ? 'bg-white shadow-sm text-wasabi' : 'text-stone-400'}`}
                        >
                            公帳
                        </button>
                        <button
                            type="button"
                            onClick={() => setExpenseType('PERSONAL')}
                            className={`flex-1 text-xs font-bold py-2.5 rounded-lg transition-all ${expenseType === 'PERSONAL' ? 'bg-white shadow-sm text-terracotta' : 'text-stone-400'}`}
                        >
                            私帳
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                            <label className="text-[10px] font-bold text-stone-400 uppercase mb-2 block tracking-wider">日期</label>
                            <input 
                                type="date"
                                value={newExpenseDate}
                                onChange={e => setNewExpenseDate(e.target.value)}
                                className="w-full bg-stone-50 rounded-xl px-3 py-3 text-xs outline-none focus:ring-1 focus:ring-wasabi transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-stone-400 uppercase mb-2 block tracking-wider">時間</label>
                            <input 
                                type="time"
                                value={newExpenseTime}
                                onChange={e => setNewExpenseTime(e.target.value)}
                                className="w-full bg-stone-50 rounded-xl px-3 py-3 text-xs outline-none focus:ring-1 focus:ring-wasabi transition-all"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="text-[10px] font-bold text-stone-400 uppercase mb-2 block tracking-wider">付款方式</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('CASH')}
                                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold border transition-all ${paymentMethod === 'CASH' ? 'bg-wasabi/10 border-wasabi text-wasabi' : 'bg-stone-50 border-transparent text-stone-400'}`}
                            >
                                <BanknoteIcon className="w-4 h-4" /> 現金
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('CARD')}
                                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold border transition-all ${paymentMethod === 'CARD' ? 'bg-ocean/10 border-ocean text-ocean' : 'bg-stone-50 border-transparent text-stone-400'}`}
                            >
                                <CreditCardIcon className="w-4 h-4" /> 信用卡
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-4 mb-5">
                        <div className="flex-1">
                             <label className="text-[10px] font-bold text-stone-400 uppercase mb-2 block tracking-wider">項目</label>
                             <input 
                                type="text"
                                placeholder={expenseType === 'SHARED' ? "例如：居酒屋" : "例如：伴手禮"}
                                value={desc}
                                onChange={e => setDesc(e.target.value)}
                                className="w-full bg-stone-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-wasabi transition-all placeholder:text-stone-300"
                            />
                        </div>
                        <div className="w-1/3">
                             <label className="text-[10px] font-bold text-stone-400 uppercase mb-2 block tracking-wider">金額</label>
                             <input 
                                type="number"
                                placeholder="¥"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full bg-stone-50 rounded-xl px-4 py-3 text-sm outline-none font-mono focus:ring-1 focus:ring-wasabi transition-all placeholder:text-stone-300"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                         <label className="text-[10px] font-bold text-stone-400 uppercase mb-2 block tracking-wider">
                            {expenseType === 'SHARED' ? '誰先付錢？' : '誰的花費？'}
                         </label>
                         <div className="relative">
                            <select 
                                value={payer}
                                onChange={e => setPayer(e.target.value)}
                                className="w-full appearance-none bg-stone-50 rounded-xl px-4 py-3 text-sm outline-none text-sumi font-bold focus:ring-1 focus:ring-wasabi transition-all"
                                required
                            >
                                <option value="" disabled>選擇成員</option>
                                {contactNames.map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-400">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                         </div>
                    </div>

                    {expenseType === 'SHARED' && (
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">分攤對象</label>
                                <button type="button" onClick={toggleAllBeneficiaries} className="text-[10px] text-wasabi font-bold hover:underline">
                                    {selectedBeneficiaries.length === contactNames.length ? '取消全選' : '全選'}
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {contactNames.map(name => {
                                    const isSelected = selectedBeneficiaries.includes(name);
                                    return (
                                        <button
                                            key={name}
                                            type="button"
                                            onClick={() => toggleBeneficiary(name)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                                                isSelected 
                                                ? 'bg-wasabi text-white border-wasabi shadow-md' 
                                                : 'bg-white text-stone-400 border-stone-200 hover:bg-stone-50'
                                            }`}
                                        >
                                            {name}
                                        </button>
                                    );
                                })}
                                {contactNames.length === 0 && <span className="text-xs text-stone-300 italic">無聯絡人</span>}
                            </div>
                        </div>
                    )}

                    <button type="submit" disabled={!amount || !desc || !payer} className="w-full bg-sumi text-white font-bold px-6 py-4 rounded-2xl text-sm disabled:opacity-50 hover:bg-black shadow-lg transition-transform active:scale-[0.98]">
                        確認新增
                    </button>
                </form>

                {/* List Filters */}
                <div className="flex p-1.5 bg-stone-100 rounded-2xl mb-6 mx-4">
                    <button
                        onClick={() => setViewMode('SHARED')}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${viewMode === 'SHARED' ? 'bg-white text-wasabi shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                        公帳紀錄
                    </button>
                    <button
                        onClick={() => setViewMode('PERSONAL')}
                        className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${viewMode === 'PERSONAL' ? 'bg-white text-terracotta shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                        私帳紀錄
                    </button>
                </div>

                {viewMode === 'PERSONAL' && (
                    <div className="flex overflow-x-auto gap-2 pb-4 mb-2 no-scrollbar snap-x px-4">
                        {contactNames.map(name => (
                            <button
                                key={name}
                                onClick={() => setSelectedContact(name)}
                                className={`snap-start whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold border transition-all ${selectedContact === name ? 'bg-terracotta text-white border-terracotta shadow-md' : 'bg-white text-stone-400 border-stone-200'}`}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                )}

                <div className="space-y-4 px-1">
                    {filteredExpenses.length === 0 ? (
                        <div className="text-center py-12">
                             <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <WalletIcon className="w-6 h-6 text-stone-200" />
                             </div>
                             <p className="text-stone-300 text-xs font-bold">沒有紀錄</p>
                        </div>
                    ) : (
                        filteredExpenses.map((ex) => {
                            const benes = (ex.beneficiaries && ex.beneficiaries.length > 0) ? ex.beneficiaries : contactNames;
                            const isAll = benes.length === contactNames.length && contactNames.length > 0;
                            const isPersonal = isPersonalExpense(ex);
                            const historicalRate = ex.exchangeRate || tripData.exchangeRate;

                            return (
                                <div key={ex.id} className="bg-white p-5 rounded-2xl border border-stone-50 shadow-soft flex flex-col gap-3 relative overflow-hidden group">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${isPersonal ? 'bg-terracotta' : 'bg-wasabi'}`}></div>

                                    <div className="flex justify-between items-start pl-3">
                                        <div>
                                            <p className="font-extrabold text-sumi text-base">{ex.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded ${isPersonal ? 'bg-stone-400' : 'bg-stone-600'}`}>
                                                    {isPersonal ? `${ex.payer}` : `${ex.payer} 付`}
                                                </span>
                                                <div className="flex items-center gap-1 text-[10px] font-mono text-stone-300">
                                                    {ex.timestamp ? (
                                                        <>
                                                            <span>{ex.timestamp.slice(5, 10)}</span>
                                                            <span>{ex.timestamp.slice(11, 16)}</span>
                                                        </>
                                                    ) : (
                                                        <span>{ex.date.slice(5)}</span>
                                                    )}
                                                </div>
                                                {ex.paymentMethod && (
                                                    <span className="text-[10px] text-stone-300 ml-1">
                                                        {ex.paymentMethod === 'CARD' ? <CreditCardIcon className="w-3 h-3" /> : <BanknoteIcon className="w-3 h-3" />}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono font-bold text-lg text-sumi">¥{ex.amount.toLocaleString()}</p>
                                            <p className="text-[10px] text-stone-400 font-bold">≈ NT${Math.round(ex.amount * historicalRate).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-end pl-3 pt-2 border-t border-dashed border-stone-50">
                                        <div className="flex flex-wrap gap-1 max-w-[80%]">
                                            {!isPersonal && (
                                                <>
                                                    <span className="text-[10px] text-stone-300 mr-1 mt-0.5">分攤:</span>
                                                    {isAll ? (
                                                        <span className="text-[10px] font-bold text-wasabi bg-wasabi/5 px-2 py-0.5 rounded-full border border-wasabi/10">全體</span>
                                                    ) : (
                                                        benes.map(b => (
                                                            <span key={b} className="text-[10px] text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full">{b}</span>
                                                        ))
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        <DeleteButton 
                                            onDelete={() => setTripData({...tripData, expenses: tripData.expenses.filter(e => e.id !== ex.id)})} 
                                            className="text-stone-300 hover:text-coral p-2 -mr-2 -mb-2"
                                            iconSize="w-4 h-4"
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
             </section>
        </div>
    );
};

const ShoppingSection = ({ tripData, setTripData }: { tripData: TripData, setTripData: (d: TripData) => void }) => {
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
    const [newItemName, setNewItemName] = useState('');
    const [newItemNote, setNewItemNote] = useState('');
    const [newItemImage, setNewItemImage] = useState<string | undefined>(undefined);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [isEditingCategory, setIsEditingCategory] = useState<string | null>(null);
    const [newCatName, setNewCatName] = useState('');
    const [newCatEmoji, setNewCatEmoji] = useState('😊');

    const [viewingItem, setViewingItem] = useState<ShoppingItem | null>(null);
    const [newLocName, setNewLocName] = useState('');
    const [newLocAddress, setNewLocAddress] = useState('');
    const [newLocNote, setNewLocNote] = useState('');
    const [editingLocId, setEditingLocId] = useState<string | null>(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingLocTitle, setIsEditingLocTitle] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const locationFormRef = useRef<HTMLFormElement>(null);
    const itemFormRef = useRef<HTMLDivElement>(null);

    const activeCategory = tripData.shoppingCategories.find(c => c.id === activeCategoryId);
    const categoryItems = tripData.shoppingList.filter(i => i.categoryId === activeCategoryId);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 600; 
                    const scaleSize = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                    setNewItemImage(canvas.toDataURL('image/jpeg', 0.7));
                }
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    const handleCreateOrEditCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newCatName) return;
        
        const fixedColor: ShoppingColorType = 'ocean';

        if (isEditingCategory) {
             setTripData({
                ...tripData,
                shoppingCategories: tripData.shoppingCategories.map(c => c.id === isEditingCategory ? { ...c, name: newCatName, icon: newCatEmoji } : c)
            });
            setIsEditingCategory(null);
        } else {
             const newCat: ShoppingCategory = {
                id: Date.now().toString(),
                name: newCatName,
                icon: newCatEmoji,
                color: fixedColor
            };
            setTripData({
                ...tripData,
                shoppingCategories: [...tripData.shoppingCategories, newCat]
            });
        }
       
        setNewCatName('');
        setNewCatEmoji('😊');
        setIsCreatingCategory(false);
    };

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newItemName || !activeCategoryId) return;

        if (editingItemId) {
            setTripData({
                ...tripData,
                shoppingList: tripData.shoppingList.map(item => item.id === editingItemId ? {
                    ...item,
                    name: newItemName,
                    note: newItemNote,
                    image: newItemImage
                } : item)
            });
            setEditingItemId(null);
        } else {
            setTripData({
                ...tripData,
                shoppingList: [...tripData.shoppingList, {
                    id: Date.now().toString(),
                    name: newItemName,
                    note: newItemNote,
                    categoryId: activeCategoryId,
                    isBought: false,
                    image: newItemImage
                }]
            });
        }
        
        setNewItemName('');
        setNewItemNote('');
        setNewItemImage(undefined);
    };

    const deleteItem = (id: string) => {
        setTripData({
            ...tripData,
            shoppingList: tripData.shoppingList.filter(i => i.id !== id)
        });
        if(viewingItem?.id === id) setViewingItem(null);
    };

    const deleteCategory = (id: string) => {
        setTripData({
            ...tripData,
            shoppingCategories: tripData.shoppingCategories.filter(c => c.id !== id),
            shoppingList: tripData.shoppingList.filter(i => i.categoryId !== id)
        });
        setActiveCategoryId(null);
    };

    const handleAddLocation = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newLocName) return;

        if (editingLocId) {
             setTripData({
                ...tripData,
                shoppingLocations: tripData.shoppingLocations.map(loc => loc.id === editingLocId ? { ...loc, name: newLocName, address: newLocAddress, note: newLocNote } : loc)
            });
            setEditingLocId(null);
        } else {
            setTripData({
                ...tripData,
                shoppingLocations: [...tripData.shoppingLocations, {
                    id: Date.now().toString(),
                    name: newLocName,
                    address: newLocAddress,
                    note: newLocNote
                }]
            });
        }
        setNewLocName('');
        setNewLocAddress('');
        setNewLocNote('');
    };

    const handleDeleteLocation = (id: string) => {
        setTripData({
            ...tripData,
            shoppingLocations: tripData.shoppingLocations.filter(l => l.id !== id)
        });
    };

    const handleEditLocation = (loc: ShoppingLocation) => {
        setNewLocName(loc.name);
        setNewLocAddress(loc.address);
        setNewLocNote(loc.note || '');
        setEditingLocId(loc.id);
        
        if (locationFormRef.current) {
            locationFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const startEditCategory = (cat: ShoppingCategory, e: React.MouseEvent) => {
        e.stopPropagation();
        setNewCatName(cat.name);
        setNewCatEmoji(cat.icon);
        setIsEditingCategory(cat.id);
        setIsCreatingCategory(true);
    };

    const startEditItem = (item: ShoppingItem) => {
        setNewItemName(item.name);
        setNewItemNote(item.note || '');
        setNewItemImage(item.image);
        setEditingItemId(item.id);

        if (itemFormRef.current) {
            itemFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    if (activeCategoryId) {
        const styles = getShoppingColor(activeCategory?.color || 'slate');
        
        return (
            <div className="pb-24 px-7 animate-[fadeIn_0.3s_ease-out]">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setActiveCategoryId(null)} className="p-2 bg-stone-100 rounded-full hover:bg-stone-200">
                        <ArrowLeftIcon className="w-5 h-5 text-stone-500" />
                    </button>
                    <div className="flex-1">
                        <h2 className="text-xl font-black text-sumi flex items-center gap-2">
                            <span>{activeCategory?.icon}</span>
                            <span>{activeCategory?.name}</span>
                            <button onClick={(e) => activeCategory && startEditCategory(activeCategory, e)} className="p-1 text-stone-300 hover:text-stone-500">
                                <EditIcon className="w-4 h-4" />
                            </button>
                        </h2>
                    </div>
                    <DeleteButton onDelete={() => deleteCategory(activeCategoryId)} className="ml-auto p-2 bg-rose-50 text-rose-500 rounded-full" />
                </div>
                
                {/* Edit Category Form (reused) */}
                 {isCreatingCategory && isEditingCategory && (
                    <form onSubmit={handleCreateOrEditCategory} className="bg-stone-50 border border-stone-100 border-dashed p-4 rounded-2xl mb-6 animate-[fadeIn_0.2s_ease-out]">
                        <p className="text-xs font-bold text-terracotta mb-3">編輯分類</p>
                        <div className="flex gap-3 mb-3">
                            <input type="text" value={newCatEmoji} onChange={e => setNewCatEmoji(e.target.value)} className="w-14 text-center bg-white rounded-xl text-xl outline-none shadow-sm" maxLength={2} />
                            <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} className="flex-1 bg-white px-4 py-3 rounded-xl text-sm outline-none shadow-sm" autoFocus />
                        </div>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => { setIsCreatingCategory(false); setIsEditingCategory(null); setNewCatName(''); setNewCatEmoji('😊'); }} className="flex-1 bg-stone-200 text-stone-500 font-bold py-3 rounded-xl text-xs">取消</button>
                            <button type="submit" className="flex-1 bg-coral text-white font-bold py-3 rounded-xl text-xs">更新</button>
                        </div>
                    </form>
                )}

                <div className="flex flex-col gap-3 mb-10">
                    {categoryItems.map(item => (
                        <div 
                            key={item.id} 
                            onClick={() => setViewingItem(item)}
                            className={`bg-white rounded-2xl p-2 shadow-soft border flex items-center gap-3 transition-colors cursor-pointer ${editingItemId === item.id ? 'border-terracotta bg-orange-50/10 ring-1 ring-terracotta' : 'border-stone-100'}`}
                        >
                             <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-50 flex-shrink-0 border border-stone-100 relative">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-ocean/5">
                                        <ShoppingBagIcon className="w-5 h-5 text-ocean/30" />
                                    </div>
                                )}
                             </div>

                             <div className="flex-1 min-w-0 py-1">
                                <h3 className="font-extrabold text-sumi text-sm truncate">{item.name}</h3>
                                {item.note && <p className="text-xs text-stone-400 mt-0.5 truncate">{item.note.replace(/\n/g, ' ')}</p>}
                             </div>

                             <div className="flex flex-col gap-1 pr-1">
                                <button onClick={(e) => { e.stopPropagation(); startEditItem(item); }} className={`p-2 rounded-full hover:bg-stone-100 ${editingItemId === item.id ? 'bg-terracotta text-white hover:bg-terracotta' : 'bg-stone-50 text-stone-400'}`}>
                                    <EditIcon className="w-3.5 h-3.5" />
                                </button>
                                <DeleteButton onDelete={() => deleteItem(item.id)} className="p-2 bg-stone-50 text-stone-400 rounded-full hover:bg-stone-100" iconSize="w-3.5 h-3.5" />
                             </div>
                        </div>
                    ))}
                </div>
                
                {/* Add/Edit Item Form (List Style) */}
                <div ref={itemFormRef} className={`bg-stone-50 border border-stone-100 border-dashed rounded-2xl p-4 flex flex-col gap-3 scroll-mt-28 transition-colors ${editingItemId ? 'bg-orange-50/50 border-orange-100' : ''}`}>
                     <p className={`text-xs font-bold ${editingItemId ? 'text-terracotta' : 'text-stone-400'}`}>
                        {editingItemId ? `正在編輯：${newItemName}` : '新增商品'}
                    </p>
                    <div className="flex gap-3">
                            <div className="relative flex-shrink-0">
                            <button 
                                type="button" 
                                onClick={() => fileInputRef.current?.click()}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${newItemImage ? 'border-ocean bg-ocean/10' : 'border-stone-200 bg-white text-stone-300'}`}
                            >
                                {newItemImage ? <img src={newItemImage} className="w-full h-full rounded-xl object-cover" /> : <CameraIcon className="w-5 h-5" />}
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </div>
                        <input 
                            type="text"
                            placeholder="品名..."
                            value={newItemName}
                            onChange={e => setNewItemName(e.target.value)}
                            className="flex-1 bg-white px-3 rounded-xl text-sm outline-none shadow-sm"
                        />
                    </div>
                    <textarea 
                        placeholder="商品介紹"
                        value={newItemNote}
                        onChange={e => setNewItemNote(e.target.value)}
                        className="w-full bg-white px-3 py-2 rounded-xl text-xs outline-none shadow-sm resize-none leading-relaxed"
                        rows={3}
                    />
                    <div className="flex gap-2">
                        {editingItemId && <button onClick={() => { setEditingItemId(null); setNewItemName(''); setNewItemNote(''); setNewItemImage(undefined); }} className="flex-1 bg-stone-200 text-stone-500 py-2 rounded-xl text-xs font-bold">取消</button>}
                        <button onClick={handleAddItem} disabled={!newItemName} className="flex-1 bg-sumi text-white py-3 rounded-xl text-xs font-bold disabled:opacity-50 transition-all active:scale-[0.98]">
                            {editingItemId ? '更新商品' : '新增'}
                        </button>
                    </div>
                </div>

                {/* Item Detail Modal */}
                {viewingItem && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={() => setViewingItem(null)}>
                        <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                            {viewingItem.image && (
                                <div className="h-64 w-full relative">
                                    <img src={viewingItem.image} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                </div>
                            )}
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                     <h3 className="text-2xl font-black text-sumi">{viewingItem.name}</h3>
                                     <div className="flex gap-2">
                                         <button onClick={() => { startEditItem(viewingItem); setViewingItem(null); }} className="bg-stone-100 text-stone-400 p-2 rounded-full">
                                            <EditIcon className="w-4 h-4" />
                                         </button>
                                         <DeleteButton onDelete={() => deleteItem(viewingItem.id)} className="bg-stone-100 text-stone-400 p-2 rounded-full" />
                                     </div>
                                </div>
                                <div className="bg-stone-50 p-4 rounded-xl text-stone-600 text-sm leading-relaxed mb-6 whitespace-pre-line">
                                    {viewingItem.note || "無備註"}
                                </div>
                                <button onClick={() => setViewingItem(null)} className="w-full bg-sumi text-white font-bold py-4 rounded-2xl">關閉</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="pb-24 space-y-10 px-7">
            {/* Shopping Locations */}
            <section>
                 <div className="flex items-center gap-3 mb-6 mt-0">
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
                        <MapPinIcon className="w-4 h-4 text-stone-500" />
                    </div>
                    {isEditingLocTitle ? (
                        <input 
                            type="text" 
                            value={tripData.shoppingLocationTitle}
                            onChange={(e) => setTripData({...tripData, shoppingLocationTitle: e.target.value})}
                            onBlur={() => setIsEditingLocTitle(false)}
                            autoFocus
                            className="text-lg font-black text-sumi bg-transparent outline-none border-b border-stone-300 w-48"
                        />
                    ) : (
                         <h2 onClick={() => setIsEditingLocTitle(true)} className="text-lg font-black text-sumi flex items-center gap-2">
                            {tripData.shoppingLocationTitle}
                            <EditIcon className="w-4 h-4 text-stone-200" />
                        </h2>
                    )}
                </div>

                <div className="space-y-4 mb-8">
                    {tripData.shoppingLocations.map(loc => (
                        <div key={loc.id} className={`bg-white p-4 rounded-2xl border shadow-soft flex justify-between items-start transition-colors ${editingLocId === loc.id ? 'border-terracotta ring-1 ring-terracotta bg-orange-50/10' : 'border-stone-100'}`}>
                             <div className="flex-1 pr-4">
                                 <h4 className="font-extrabold text-sumi text-sm">{loc.name}</h4>
                                 <p className="text-xs text-stone-400 mt-1">{loc.address}</p>
                                 {loc.note && <p className="text-xs text-stone-500 mt-2 bg-stone-50 p-2 rounded-lg">{loc.note}</p>}
                             </div>
                             <div className="flex flex-col gap-2">
                                <button 
                                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.name + ' ' + loc.address)}`, '_blank')}
                                    className="p-2 bg-ocean/10 text-ocean rounded-full hover:bg-ocean/20"
                                >
                                    <PaperPlaneIcon className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleEditLocation(loc)} className={`p-2 rounded-full hover:bg-stone-100 ${editingLocId === loc.id ? 'bg-terracotta text-white hover:bg-terracotta' : 'bg-stone-50 text-stone-400'}`}>
                                    <EditIcon className="w-4 h-4" />
                                </button>
                                <DeleteButton onDelete={() => handleDeleteLocation(loc.id)} className="p-2 bg-stone-50 text-stone-400 rounded-full hover:bg-stone-100" />
                             </div>
                        </div>
                    ))}
                </div>

                <form ref={locationFormRef} onSubmit={handleAddLocation} className={`bg-stone-50 border border-stone-100 border-dashed rounded-2xl p-4 mb-10 scroll-mt-28 transition-colors ${editingLocId ? 'bg-orange-50/50 border-orange-100' : ''}`}>
                    <p className={`text-xs font-bold mb-3 ${editingLocId ? 'text-terracotta' : 'text-stone-400'}`}>
                        {editingLocId ? `正在編輯：${newLocName}` : '新增地點'}
                    </p>
                    <div className="space-y-3">
                        <input 
                            type="text" 
                            placeholder="地點名稱"
                            value={newLocName}
                            onChange={e => setNewLocName(e.target.value)}
                            className="w-full bg-white bg-white px-4 py-3 rounded-xl text-xs outline-none shadow-sm"
                        />
                        <input 
                            type="text" 
                            placeholder="地址/區域 (用於導航)"
                            value={newLocAddress}
                            onChange={e => setNewLocAddress(e.target.value)}
                            className="w-full bg-white px-4 py-3 rounded-xl text-xs outline-none shadow-sm"
                        />
                        <textarea 
                            placeholder="備註/介紹 (選填)"
                            value={newLocNote}
                            onChange={e => setNewLocNote(e.target.value)}
                            className="w-full bg-white px-4 py-3 rounded-xl text-xs outline-none shadow-sm resize-none"
                            rows={2}
                        />
                        <div className="flex gap-2">
                             {editingLocId && <button type="button" onClick={() => { setEditingLocId(null); setNewLocName(''); setNewLocAddress(''); setNewLocNote(''); }} className="flex-1 bg-stone-200 text-stone-500 font-bold py-3 rounded-xl text-xs">取消</button>}
                             <button type="submit" disabled={!newLocName} className="flex-1 bg-sumi text-white font-bold py-3 rounded-xl text-xs disabled:opacity-50 transition-all active:scale-[0.98]">
                                {editingLocId ? '更新地點' : '新增地點'}
                            </button>
                        </div>
                    </div>
                </form>
            </section>
            
            {/* Shopping Lists Categories */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-coral/10 flex items-center justify-center">
                        <ShoppingBagIcon className="w-4 h-4 text-coral" />
                    </div>
                    {isEditingTitle ? (
                        <input 
                            type="text" 
                            value={tripData.shoppingTitle}
                            onChange={(e) => setTripData({...tripData, shoppingTitle: e.target.value})}
                            onBlur={() => setIsEditingTitle(false)}
                            autoFocus
                            className="text-lg font-black text-sumi bg-transparent outline-none border-b border-coral w-48"
                        />
                    ) : (
                        <h2 onClick={() => setIsEditingTitle(true)} className="text-lg font-black text-sumi flex items-center gap-2">
                            {tripData.shoppingTitle}
                            <EditIcon className="w-4 h-4 text-stone-200" />
                        </h2>
                    )}
                </div>
                <button onClick={() => { setIsCreatingCategory(!isCreatingCategory); setIsEditingCategory(null); setNewCatName(''); setNewCatEmoji('😊'); }} className="text-xs font-bold text-white bg-sumi px-4 py-2 rounded-full hover:bg-black transition-colors">
                    {isCreatingCategory && !isEditingCategory ? '取消' : '建立清單'}
                </button>
            </div>

            {/* Category Creation Form */}
            {isCreatingCategory && (
                <form onSubmit={handleCreateOrEditCategory} className="bg-stone-50 border border-stone-100 border-dashed p-4 rounded-2xl mb-6 animate-[fadeIn_0.2s_ease-out]">
                    <p className={`text-xs font-bold mb-3 ${isEditingCategory ? 'text-terracotta' : 'text-stone-400'}`}>{isEditingCategory ? '編輯分類' : '建立新分類'}</p>
                    <div className="flex gap-3 mb-3">
                        <input 
                            type="text" 
                            value={newCatEmoji}
                            onChange={e => setNewCatEmoji(e.target.value)}
                            className="w-14 text-center bg-white rounded-xl text-xl outline-none shadow-sm"
                            maxLength={2}
                        />
                        <input 
                            type="text" 
                            placeholder="清單名稱 (例: 藥妝)"
                            value={newCatName}
                            onChange={e => setNewCatName(e.target.value)}
                            className="flex-1 bg-white px-4 py-3 rounded-xl text-sm outline-none shadow-sm"
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-2">
                         {isEditingCategory && <button type="button" onClick={() => { setIsCreatingCategory(false); setIsEditingCategory(null); setNewCatName(''); setNewCatEmoji('😊'); }} className="flex-1 bg-stone-200 text-stone-500 font-bold py-3 rounded-xl text-xs">取消</button>}
                        <button type="submit" className="flex-1 bg-coral text-white font-bold py-3 rounded-xl text-xs shadow-md transition-transform active:scale-[0.98]">{isEditingCategory ? '更新' : '確認建立'}</button>
                    </div>
                </form>
            )}

            {/* Category Grid */}
            <div className="grid grid-cols-2 gap-3 mb-12">
                {tripData.shoppingCategories.map(cat => {
                    const styles = getShoppingColor(cat.color);
                    const count = tripData.shoppingList.filter(i => i.categoryId === cat.id).length;
                    
                    return (
                        <div key={cat.id} className="relative group">
                             <button 
                                onClick={() => setActiveCategoryId(cat.id)}
                                className={`w-full overflow-hidden rounded-2xl p-5 text-left transition-all hover:scale-[1.02] active:scale-[0.98] border shadow-sm ${styles.light} ${styles.border} backdrop-blur-md`}
                            >
                                <div className="text-3xl mb-3">{cat.icon}</div>
                                <h3 className={`font-black text-sm mb-1 ${styles.text}`}>{cat.name}</h3>
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{count} ITEMS</p>
                            </button>
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => startEditCategory(cat, e)} className="p-1.5 bg-white/50 hover:bg-white rounded-full text-stone-400 hover:text-stone-600 backdrop-blur-sm">
                                    <EditIcon className="w-3.5 h-3.5" />
                                </button>
                                <DeleteButton onDelete={() => deleteCategory(cat.id)} className="p-1.5 bg-rose-50/80 hover:bg-rose-100 rounded-full text-rose-500 backdrop-blur-sm" iconSize="w-3.5 h-3.5" />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export const ResourcesPage = (props: ResourcesPageProps) => {
    switch(props.activeSubTab) {
        case 'info': return <InfoSection {...props} />;
        case 'money': return <MoneySection {...props} />;
        case 'shopping': return <ShoppingSection {...props} />;
        default: return null;
    }
};