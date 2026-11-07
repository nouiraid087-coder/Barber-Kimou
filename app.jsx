```react
import React, { useState } from 'react';
import { 
  Scissors, 
  UserCheck, 
  Clock, 
  Users, 
  CheckCircle2, 
  PlusCircle, 
  Sparkles, 
  DollarSign, 
  ShieldCheck, 
  Trash2, 
  Lock, 
  Unlock, 
  User, 
  AlertCircle,
  Plus
} from 'lucide-react';

export default function BarberApp() {
  // Mode View: 'client' or 'admin'
  const [viewMode, setViewMode] = useState('client');

  // Shop Status
  const [isShopOpen, setIsShopOpen] = useState(true);
  
  // Available Services (Updated per client request)
  const [servicesList, setServicesList] = useState([
    { id: 'adult_haircut', name: 'حلاقة شعر (كبار)', price: 300, duration: 25 },
    { id: 'child_haircut', name: 'حلاقة شعر (صغار)', price: 200, duration: 25 },
    { id: 'beard', name: 'حلاقة الذقن (اللحية)', price: 100, duration: 25 },
    { id: 'full_adult', name: 'باك كامل (شعر كبار + ذقن)', price: 400, duration: 25 },
  ]);

  // Admin New Service Form Input
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('25');
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);

  // Initial Mock Queue Data
  const [queue, setQueue] = useState([
    {
      id: 1,
      name: 'أحمد بن علي',
      phone: '0555123456',
      serviceId: 'adult_haircut',
      serviceName: 'حلاقة شعر (كبار)',
      duration: 25,
      price: 300,
      status: 'active', // active = inside barber chair
      bookedAt: '10:00'
    },
    {
      id: 2,
      name: 'محمد الصغير',
      phone: '0661987654',
      serviceId: 'child_haircut',
      serviceName: 'حلاقة شعر (صغار)',
      duration: 25,
      price: 200,
      status: 'waiting',
      bookedAt: '10:25'
    },
    {
      id: 3,
      name: 'كريم مراد',
      phone: '0770112233',
      serviceId: 'beard',
      serviceName: 'حلاقة الذقن (اللحية)',
      duration: 25,
      price: 100,
      status: 'waiting',
      bookedAt: '10:50'
    }
  ]);

  // Daily Statistics
  const [stats, setStats] = useState({
    completedToday: 4,
    revenueToday: 1100,
  });

  // Client Booking Form State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedService, setSelectedService] = useState('adult_haircut');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [lastBookedId, setLastBookedId] = useState(null);

  // Admin Manual Add Form State
  const [adminName, setAdminName] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminService, setAdminService] = useState('adult_haircut');

  // Currently Active Client (the one on the chair)
  const activeClient = queue.find(item => item.status === 'active');
  const waitingQueue = queue.filter(item => item.status === 'waiting');

  // Total Waiting Time Calculation (25 mins standard per waiting customer)
  const totalWaitingTime = waitingQueue.reduce((acc, curr) => acc + curr.duration, 0);

  // Handle Client Booking Submission
  const handleClientBooking = (e) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) return;

    const serviceObj = servicesList.find(s => s.id === selectedService) || servicesList[0];
    const newBooking = {
      id: Date.now(),
      name: clientName.trim(),
      phone: clientPhone.trim(),
      serviceId: selectedService,
      serviceName: serviceObj.name,
      duration: serviceObj.duration || 25,
      price: serviceObj.price,
      status: queue.length === 0 ? 'active' : 'waiting',
      bookedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setQueue([...queue, newBooking]);
    setLastBookedId(newBooking.id);
    setBookingSuccess(true);
    setClientName('');
    setClientPhone('');

    setTimeout(() => {
      setBookingSuccess(false);
    }, 4000);
  };

  // Handle Admin Manual Add
  const handleAdminAdd = (e) => {
    e.preventDefault();
    if (!adminName.trim()) return;

    const serviceObj = servicesList.find(s => s.id === adminService) || servicesList[0];
    const newBooking = {
      id: Date.now(),
      name: adminName.trim(),
      phone: adminPhone.trim() || 'حضوري بالمحل',
      serviceId: adminService,
      serviceName: serviceObj.name,
      duration: serviceObj.duration || 25,
      price: serviceObj.price,
      status: queue.length === 0 ? 'active' : 'waiting',
      bookedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setQueue([...queue, newBooking]);
    setAdminName('');
    setAdminPhone('');
  };

  // Add new service dynamically (Admin Feature)
  const handleAddNewService = (e) => {
    e.preventDefault();
    if (!newServiceName.trim() || !newServicePrice) return;

    const newSrv = {
      id: `custom_${Date.now()}`,
      name: newServiceName.trim(),
      price: Number(newServicePrice),
      duration: Number(newServiceDuration) || 25
    };

    setServicesList([...servicesList, newSrv]);
    setNewServiceName('');
    setNewServicePrice('');
    setShowAddServiceModal(false);
  };

  // Barber Action: Complete Current Customer & Move to Next
  const handleCompleteCurrent = () => {
    if (!activeClient) return;

    // Update stats
    setStats(prev => ({
      completedToday: prev.completedToday + 1,
      revenueToday: prev.revenueToday + activeClient.price
    }));

    // Remove finished client, set next waiting client as active
    const nextQueue = queue.filter(item => item.id !== activeClient.id);
    if (nextQueue.length > 0) {
      nextQueue[0].status = 'active';
    }
    setQueue(nextQueue);
  };

  // Remove / Cancel Client from Queue
  const handleCancelClient = (id) => {
    const updated = queue.filter(item => item.id !== id);
    if (activeClient && activeClient.id === id && updated.length > 0) {
      updated[0].status = 'active';
    }
    setQueue(updated);
  };

  // Helper to calculate waiting time before a specific client
  const getMinutesBeforeClient = (targetId) => {
    let sum = 0;
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].id === targetId) break;
      sum += queue[i].duration;
    }
    return sum;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans dir-rtl" dir="rtl">
      {/* Top Main Navigation */}
      <header className="bg-slate-900 border-b border-amber-500/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo Barber Akram */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-xl text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-black text-lg sm:text-xl bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent tracking-wide">
                Barber Akram
              </h1>
              <p className="text-[11px] text-amber-500/80 font-medium">حجز المواعيد وتنظيم الطابور المباشر</p>
            </div>
          </div>

          {/* View Mode Switcher Pills */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('client')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'client' 
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              واجهة الزبائن
            </button>
            <button
              onClick={() => setViewMode('admin')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'admin' 
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              لوحة الحلاق (أكرم)
            </button>
          </div>

        </div>
      </header>

      {/* Header Banner - Shop Status */}
      <div className="bg-slate-900/60 border-b border-slate-800 py-3">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
          
          <div className="flex items-center gap-2.5">
            <span className={`w-3 h-3 rounded-full ${isShopOpen ? 'bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50' : 'bg-rose-500'}`} />
            <span className="font-semibold text-slate-300">حالة الصالون:</span>
            <span className={`font-bold ${isShopOpen ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isShopOpen ? 'مفتوح ويستقبل الزبائن' : 'مغلق حالياً'}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Users className="w-4 h-4 text-amber-400" />
              <span>المنتظرون في القائمة:</span>
              <strong className="text-slate-100 font-bold">{waitingQueue.length} أشخاص</strong>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>إجمالي وقت الانتظار:</span>
              <strong className="text-slate-100 font-bold">{totalWaitingTime} دقيقة</strong>
            </div>
          </div>

        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* ======================================================== */}
        {/* ==================== CLIENT VIEW ======================= */}
        {/* ======================================================== */}
        {viewMode === 'client' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left/Main Column: Active Turn & Queue */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* CURRENTLY ON CHAIR BARBER CARD */}
              <div className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border-2 border-amber-500/40 rounded-2xl p-6 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 left-0 bg-amber-500 text-slate-950 px-4 py-1 rounded-br-xl text-xs font-black tracking-wider">
                  على الكرسي الآن
                </div>

                {activeClient ? (
                  <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 font-black text-2xl">
                        {activeClient.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-100">{activeClient.name}</h3>
                        <p className="text-xs text-amber-400 font-semibold mt-0.5">{activeClient.serviceName}</p>
                        <span className="inline-block mt-2 text-[11px] bg-slate-950 px-2.5 py-1 rounded-md text-slate-400 border border-slate-800">
                          وقت الحجز: {activeClient.bookedAt}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 bg-slate-950/80 px-4 py-3 rounded-xl border border-slate-800">
                      <Scissors className="w-5 h-5 text-amber-400 animate-bounce" />
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">مدة الحلاقة تقريباً</div>
                        <div className="text-sm font-bold text-emerald-400">{activeClient.duration} دقيقة</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Scissors className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">الكرسي فارغ حالياً - ينتهي الانتظار فكان الأول!</p>
                  </div>
                )}
              </div>

              {/* LIVE WAITING QUEUE */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-400" />
                    قائمة المنتظرين بالدور ({waitingQueue.length})
                  </h3>
                  <span className="text-xs text-amber-500/80 font-medium">(25 دقيقة لكل زبون)</span>
                </div>

                {waitingQueue.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    <Clock className="w-10 h-10 mx-auto mb-2 opacity-50 text-amber-500/40" />
                    <p className="text-sm font-medium">لا يوجد زبائن في قائمة الانتظار حالياً.</p>
                    <p className="text-xs text-slate-600 mt-1">احجز دورك الآن لدى Barber Akram!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {waitingQueue.map((client, index) => {
                      const minutesBefore = getMinutesBeforeClient(client.id);
                      const isMyBooking = lastBookedId === client.id;

                      return (
                        <div 
                          key={client.id}
                          className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isMyBooking 
                              ? 'bg-amber-950/20 border-amber-500/60 ring-1 ring-amber-500/30' 
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 font-extrabold text-amber-400 flex items-center justify-center text-sm">
                              #{index + 1}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-200 text-sm">{client.name}</h4>
                                {isMyBooking && (
                                  <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                                    حجزك الحالي
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400">{client.serviceName}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-xs border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0 justify-between sm:justify-end">
                            <div className="text-right">
                              <span className="text-slate-500 block text-[10px]">قبل دورك:</span>
                              <span className="font-bold text-slate-300">{index + (activeClient ? 1 : 0)} زبائن</span>
                            </div>

                            <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-right">
                              <span className="text-slate-400 block text-[10px]">الوقت المتبقي لانتظارك:</span>
                              <span className="font-extrabold text-amber-400">{minutesBefore} دقيقة</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Booking Form & Services */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* BOOKING FORM */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
                <h3 className="font-bold text-lg text-slate-100 mb-1 flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-amber-400" />
                  حجز موعد جديد
                </h3>
                <p className="text-xs text-slate-400 mb-5">احجز مكانك في الطابور لمعرفة الوقت وتجنب الانتظار بالمحل</p>

                {bookingSuccess && (
                  <div className="mb-4 p-3.5 bg-emerald-950/60 border border-emerald-500/50 rounded-xl flex items-center gap-2 text-emerald-300 text-xs">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>تم تسجيل موعدك بنجاح! يمكنك إلقاء نظرة على وقتك المتبقي في القائمة.</span>
                  </div>
                )}

                {!isShopOpen ? (
                  <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl text-center">
                    <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                    <p className="text-slate-300 font-bold text-sm">المحل مغلق حالياً</p>
                    <p className="text-slate-500 text-xs mt-1">لا يمكن الحجز في الوقت الحالي، يرجى إعادة المحاولة لاحقاً.</p>
                  </div>
                ) : (
                  <form onSubmit={handleClientBooking} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">اسمك الكامل</label>
                      <input 
                        type="text" 
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="مثال: يونس بن حمودة"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">رقم الهاتف</label>
                      <input 
                        type="tel" 
                        required
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="05 / 06 / 07 ..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">اختر الخدمة</label>
                      <select 
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                      >
                        {servicesList.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} - ({service.price} دج)
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm mt-2 flex items-center justify-center gap-2"
                    >
                      <PlusCircle className="w-5 h-5" />
                      تأكيد الحجز والدخول للطابور
                    </button>
                  </form>
                )}
              </div>

              {/* SERVICES LIST & PRICING */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold text-sm text-slate-200 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  قائمة خدمات Barber Akram والأسعار
                </h3>
                <div className="space-y-2.5">
                  {servicesList.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl text-xs border border-slate-800/80">
                      <div>
                        <span className="font-bold text-slate-200">{s.name}</span>
                        <span className="text-[10px] text-slate-500 block">{s.duration} دقيقة</span>
                      </div>
                      <span className="font-black text-amber-400 text-sm">{s.price} دج</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* ==================== BARBER ADMIN ======================= */}
        {/* ======================================================== */}
        {viewMode === 'admin' && (
          <div className="space-y-6">
            
            {/* Top Stats Cards & Shop Toggle */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Shop Status Toggle Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-semibold">حالة المحل</span>
                  {isShopOpen ? <Unlock className="w-5 h-5 text-emerald-400" /> : <Lock className="w-5 h-5 text-rose-400" />}
                </div>
                <button
                  onClick={() => setIsShopOpen(!isShopOpen)}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                    isShopOpen 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30' 
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  }`}
                >
                  {isShopOpen ? 'إغلاق المحل مؤقتاً' : 'فتح المحل وتفعيل الحجز'}
                </button>
              </div>

              {/* Completed Today */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>الزبائن المكتملين اليوم</span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-slate-100">{stats.completedToday} زبون</div>
                <span className="text-[10px] text-emerald-400">عمل ممتاز يا أكرم!</span>
              </div>

              {/* Today's Revenue */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>إجمالي أرباح اليوم</span>
                  <DollarSign className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-400">{stats.revenueToday} دج</div>
                <span className="text-[10px] text-slate-500">حساب تلقائي دقيق للمداخيل</span>
              </div>

              {/* In Queue Count */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                  <span>في الانتظار الآن</span>
                  <Users className="w-5 h-5 text-sky-400" />
                </div>
                <div className="text-2xl font-black text-sky-400">{queue.length} زبون</div>
                <span className="text-[10px] text-slate-500">يتضمن الشخص الحالي</span>
              </div>

            </div>

            {/* Main Admin Controls: Active Customer & Add Manual */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Active Customer Action Box */}
              <div className="lg:col-span-7 bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 relative">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-amber-400" />
                    إدارة الزبون الحالي (على الكرسي)
                  </h3>
                  <span className="text-xs bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/30 font-semibold">
                    كرسي الحلاقة
                  </span>
                </div>

                {activeClient ? (
                  <div className="space-y-6">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <div className="text-xs text-slate-400 mb-1">الزبون الحالي:</div>
                        <h4 className="text-xl font-black text-slate-100">{activeClient.name}</h4>
                        <p className="text-xs text-amber-400 font-semibold mt-1">{activeClient.serviceName} • {activeClient.price} دج</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">الهاتف: {activeClient.phone}</p>
                      </div>

                      <div className="text-left sm:text-right border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                        <span className="text-xs text-slate-400 block">وقت الانطلاق:</span>
                        <span className="text-sm font-bold text-slate-200">{activeClient.bookedAt}</span>
                      </div>
                    </div>

                    {/* Completion Big Action Button */}
                    <button
                      onClick={handleCompleteCurrent}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-emerald-900/40 text-base flex items-center justify-center gap-3"
                    >
                      <CheckCircle2 className="w-6 h-6" />
                      الانتهاء والاستمرار للشخص التالي
                    </button>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-500">
                    <UserCheck className="w-12 h-12 mx-auto mb-2 opacity-40" />
                    <p className="text-base font-semibold text-slate-400">لا يوجد أي زبون حالياً على الكرسي</p>
                    <p className="text-xs text-slate-600 mt-1">عند تسجيل زبون جديد سيتولى الدور تلقائياً.</p>
                  </div>
                )}
              </div>

              {/* Manual Walk-in Customer Add & Manage Services */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Manual Add Form */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="font-bold text-base text-slate-100 mb-1 flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-amber-400" />
                    إضافة زبون حضوري (يدوي)
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">للزبائن الذين يحضرون مباشرة للمحل</p>

                  <form onSubmit={handleAdminAdd} className="space-y-3.5">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">اسم الزبون</label>
                      <input 
                        type="text"
                        required
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        placeholder="اسم الزبون الحضوري..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">رقم الهاتف (اختياري)</label>
                      <input 
                        type="tel"
                        value={adminPhone}
                        onChange={(e) => setAdminPhone(e.target.value)}
                        placeholder="رقم للتواصل..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">نوع الخدمة</label>
                      <select
                        value={adminService}
                        onChange={(e) => setAdminService(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                      >
                        {servicesList.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.price} دج)
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-bold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center gap-2 mt-2"
                    >
                      <PlusCircle className="w-4 h-4 text-amber-400" />
                      إضافة للقائمة فوراً
                    </button>
                  </form>
                </div>

                {/* Dynamic Service Addition Box (Future expansion) */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-200">إضافة خدمات جديدة للمستقبل</h4>
                      <p className="text-[10px] text-slate-500">إضافة مزايا أو علاجات بشرة مستقبلاً</p>
                    </div>
                    <button
                      onClick={() => setShowAddServiceModal(!showAddServiceModal)}
                      className="px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold hover:bg-amber-500/20 transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      خدمة جديدة
                    </button>
                  </div>

                  {showAddServiceModal && (
                    <form onSubmit={handleAddNewService} className="mt-4 pt-3 border-t border-slate-800 space-y-3">
                      <div>
                        <input
                          type="text"
                          placeholder="اسم الخدمة الجديدة..."
                          required
                          value={newServiceName}
                          onChange={(e) => setNewServiceName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="السعر (دج)..."
                          required
                          value={newServicePrice}
                          onChange={(e) => setNewServicePrice(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                        />
                        <input
                          type="number"
                          placeholder="المدة بالدقائق"
                          value={newServiceDuration}
                          onChange={(e) => setNewServiceDuration(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-amber-500 text-slate-950 font-bold py-1.5 rounded-lg text-xs"
                      >
                        حفظ الخدمة الجديدة
                      </button>
                    </form>
                  )}
                </div>

              </div>

            </div>

            {/* Admin Full Queue Control Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-bold text-lg text-slate-100 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                إدارة وسجل قائمة المنتظرين بالكامل
              </h3>

              {queue.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">القائمة فارغة تماماً.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">#</th>
                        <th className="py-3 px-4">الزبون</th>
                        <th className="py-3 px-4">رقم الهاتف</th>
                        <th className="py-3 px-4">الخدمة</th>
                        <th className="py-3 px-4">السعر</th>
                        <th className="py-3 px-4">الحالة</th>
                        <th className="py-3 px-4 text-left">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {queue.map((item, index) => (
                        <tr key={item.id} className="hover:bg-slate-950/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-amber-400">{index + 1}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-100">{item.name}</td>
                          <td className="py-3.5 px-4 text-slate-400">{item.phone}</td>
                          <td className="py-3.5 px-4">{item.serviceName}</td>
                          <td className="py-3.5 px-4 font-bold text-emerald-400">{item.price} دج</td>
                          <td className="py-3.5 px-4">
                            {item.status === 'active' ? (
                              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                                على الكرسي الآن
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                                ينتظر في الطابور
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-left">
                            <button
                              onClick={() => handleCancelClient(item.id)}
                              className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-lg border border-rose-800/40 transition-colors"
                              title="حذف من القائمة"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
```
