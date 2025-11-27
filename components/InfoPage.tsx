import React, { useState } from 'react';
import { TripData, Expense, FlightInfo, ItineraryState, ItemType, DaySchedule, ItineraryItem } from '../types';
import { PlaneIcon, WalletIcon, PhoneIcon, BedIcon } from './Icons';

interface InfoPageProps {
  tripData: TripData;
  setTripData: (data: TripData) => void;
  itinerary: ItineraryState;
}

export const InfoPage: React.FC<InfoPageProps> = ({ tripData, setTripData, itinerary }) => {
  const [newExpenseTitle, setNewExpenseTitle] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  // Extract Hotels from Itinerary
  const hotelList = Object.values(itinerary)
    .flatMap((day: DaySchedule) => day.items.filter((item: ItineraryItem) => item.type === ItemType.HOTEL))
    .map((item: ItineraryItem) => ({
        date: (Object.values(itinerary) as DaySchedule[]).find((d: DaySchedule) => d.items.includes(item))?.date,
        ...item
    }))
    .sort((a, b) => {
      const dateA = a.date || '';
      const dateB = b.date || '';
      return (dateA + a.time).localeCompare(dateB + b.time);
    });

  const handleUpdateFlight = (type: 'outbound' | 'inbound', field: keyof FlightInfo, value: string) => {
    // Defaults to editing 'north' group to match updated TripData structure
    setTripData({
      ...tripData,
      flights: {
        ...tripData.flights,
        north: {
            ...tripData.flights.north,
            [type]: {
                ...tripData.flights.north[type],
                [field]: value
            }
        }
      }
    });
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseTitle || !newExpenseAmount) return;

    const newExpense: Expense = {
      id: Date.now().toString(),
      title: newExpenseTitle,
      amount: parseInt(newExpenseAmount) || 0,
      payer: '我',
      beneficiaries: [],
      date: new Date().toISOString().split('T')[0]
    };

    setTripData({
      ...tripData,
      expenses: [...tripData.expenses, newExpense]
    });
    setNewExpenseTitle('');
    setNewExpenseAmount('');
  };

  const handleDeleteExpense = (id: string) => {
    setTripData({
      ...tripData,
      expenses: tripData.expenses.filter(ex => ex.id !== id)
    });
  };

  const totalBudget = tripData.expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="px-5 pt-6 pb-24 space-y-8 animate-[fadeIn_0.3s_ease-out]">
      
      {/* Flight Section */}
      <section>
        <div className="flex items-center gap-2 mb-4 text-sumi">
            <PlaneIcon className="w-5 h-5 text-ocean" />
            <h2 className="text-xl font-bold">航班資訊 (北部)</h2>
        </div>
        <div className="space-y-4">
             {/* Outbound */}
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-white bg-ocean px-2 py-1 rounded">去程 (Outbound)</span>
                    <input 
                        type="date" 
                        value={tripData.flights.north.outbound.date}
                        onChange={(e) => handleUpdateFlight('outbound', 'date', e.target.value)}
                        className="text-xs font-mono text-right bg-transparent border-none focus:ring-0 text-stone-500"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] uppercase text-stone-400 font-bold">航班</label>
                        <input 
                            type="text" 
                            placeholder="例如：CI 120"
                            value={tripData.flights.north.outbound.flightNumber}
                            onChange={(e) => handleUpdateFlight('outbound', 'flightNumber', e.target.value)}
                            className="w-full font-bold text-sumi text-lg bg-transparent placeholder:text-stone-300 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase text-stone-400 font-bold">時間</label>
                        <input 
                            type="time" 
                            value={tripData.flights.north.outbound.time}
                            onChange={(e) => handleUpdateFlight('outbound', 'time', e.target.value)}
                            className="w-full font-mono font-medium text-stone-600 bg-transparent outline-none"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="text-[10px] uppercase text-stone-400 font-bold">航廈/機場</label>
                         <input 
                            type="text" 
                            placeholder="TPE -> OKA"
                            value={tripData.flights.north.outbound.terminal}
                            onChange={(e) => handleUpdateFlight('outbound', 'terminal', e.target.value)}
                            className="w-full text-sm text-stone-600 bg-transparent outline-none placeholder:text-stone-300"
                        />
                    </div>
                </div>
             </div>

             {/* Inbound */}
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-white bg-terracotta px-2 py-1 rounded">回程 (Inbound)</span>
                     <input 
                        type="date" 
                        value={tripData.flights.north.inbound.date}
                        onChange={(e) => handleUpdateFlight('inbound', 'date', e.target.value)}
                        className="text-xs font-mono text-right bg-transparent border-none focus:ring-0 text-stone-500"
                    />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] uppercase text-stone-400 font-bold">航班</label>
                        <input 
                            type="text" 
                            placeholder="例如：CI 121"
                            value={tripData.flights.north.inbound.flightNumber}
                            onChange={(e) => handleUpdateFlight('inbound', 'flightNumber', e.target.value)}
                            className="w-full font-bold text-sumi text-lg bg-transparent placeholder:text-stone-300 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase text-stone-400 font-bold">時間</label>
                         <input 
                            type="time" 
                            value={tripData.flights.north.inbound.time}
                            onChange={(e) => handleUpdateFlight('inbound', 'time', e.target.value)}
                            className="w-full font-mono font-medium text-stone-600 bg-transparent outline-none"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="text-[10px] uppercase text-stone-400 font-bold">航廈/機場</label>
                         <input 
                            type="text" 
                            placeholder="OKA -> TPE"
                            value={tripData.flights.north.inbound.terminal}
                            onChange={(e) => handleUpdateFlight('inbound', 'terminal', e.target.value)}
                            className="w-full text-sm text-stone-600 bg-transparent outline-none placeholder:text-stone-300"
                        />
                    </div>
                </div>
             </div>
        </div>
      </section>

      {/* Accomodation Section */}
      <section>
         <div className="flex items-center gap-2 mb-4 text-sumi">
            <BedIcon className="w-5 h-5 text-slate-jp" />
            <h2 className="text-xl font-bold">住宿資訊</h2>
        </div>
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60">
            {hotelList.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-4">
                    尚未在行程中加入住宿
                </p>
            ) : (
                <div className="space-y-4">
                    {hotelList.map((hotel, idx) => (
                        <div key={idx} className="flex gap-4 items-start pb-4 border-b border-slate-200 last:border-0 last:pb-0">
                            <div className="w-16 pt-1">
                                <span className="block text-[10px] font-bold text-slate-400 uppercase">{hotel.date}</span>
                                <span className="block text-sm font-mono text-slate-600">{hotel.time}</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-800">{hotel.location}</h4>
                                {hotel.notes && <p className="text-xs text-slate-500 mt-1">{hotel.notes}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </section>

      {/* Emergency Contacts */}
      <section>
         <div className="flex items-center gap-2 mb-4 text-sumi">
            <PhoneIcon className="w-5 h-5 text-coral" />
            <h2 className="text-xl font-bold">緊急聯絡</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm flex flex-col items-center text-center">
                <span className="text-2xl font-black text-coral mb-1">110</span>
                <span className="text-xs text-stone-500 font-bold">警察局 (Police)</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm flex flex-col items-center text-center">
                <span className="text-2xl font-black text-coral mb-1">119</span>
                <span className="text-xs text-stone-500 font-bold">消防/救護 (Fire/Amb)</span>
            </div>
             <div className="col-span-2 bg-white p-4 rounded-xl border border-stone-100 shadow-sm">
                <p className="text-sm font-bold text-sumi mb-1">台北駐日經濟文化代表處那霸分處</p>
                <p className="text-coral font-mono text-lg font-bold">098-862-7008</p>
                <p className="text-xs text-stone-400 mt-1">沖繩縣那霸市久茂地 3-15-9</p>
            </div>
        </div>
      </section>

      {/* Budget/Expenses */}
      <section>
         <div className="flex items-center gap-2 mb-4 text-sumi">
            <WalletIcon className="w-5 h-5 text-wasabi" />
            <h2 className="text-xl font-bold">預算/記帳</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="bg-wasabi/10 p-5 flex justify-between items-center border-b border-wasabi/10">
                <span className="text-sm font-bold text-wasabi-dark">總花費 (JPY)</span>
                <span className="text-2xl font-black text-wasabi">¥{totalBudget.toLocaleString()}</span>
            </div>
            
            <div className="p-5">
                 {/* Input */}
                 <form onSubmit={handleAddExpense} className="flex gap-2 mb-6">
                    <input 
                        type="text" 
                        placeholder="項目" 
                        value={newExpenseTitle}
                        onChange={(e) => setNewExpenseTitle(e.target.value)}
                        className="flex-1 bg-stone-50 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-wasabi"
                    />
                    <input 
                        type="number" 
                        placeholder="¥ 金額" 
                        value={newExpenseAmount}
                        onChange={(e) => setNewExpenseAmount(e.target.value)}
                        className="w-24 bg-stone-50 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-wasabi"
                    />
                    <button type="submit" className="bg-wasabi text-white rounded-lg px-4 py-2 font-bold text-lg hover:bg-green-700">+</button>
                 </form>

                 {/* List */}
                 <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {tripData.expenses.map((ex) => (
                        <div key={ex.id} className="flex justify-between items-center text-sm group">
                            <span className="text-sumi font-medium">{ex.title}</span>
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-stone-600">¥{ex.amount.toLocaleString()}</span>
                                <button onClick={() => handleDeleteExpense(ex.id)} className="text-stone-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                            </div>
                        </div>
                    ))}
                    {tripData.expenses.length === 0 && (
                        <p className="text-center text-stone-300 text-xs italic">尚無記帳紀錄</p>
                    )}
                 </div>
            </div>
        </div>
      </section>

    </div>
  );
};