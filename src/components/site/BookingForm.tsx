import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Loader2, MapPin, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { notifyBooking } from '@/lib/booking.functions';
import { BUSINESS, whatsappLink } from '@/config/site';

const field = 'mt-2 w-full rounded-sm border border-input bg-background px-3.5 py-3 text-sm text-ivory outline-none focus-visible:ring-2 focus-visible:ring-ring';

function today() { return new Date().toISOString().slice(0, 10); }

export function BookingForm() {
  const [services, setServices] = useState<{id:string;title:string;price:string|null}[]>([]);
  const [name,setName]=useState(''); const [phone,setPhone]=useState(''); const [email,setEmail]=useState('');
  const [serviceId,setServiceId]=useState(''); const [date,setDate]=useState(today()); const [time,setTime]=useState('10:00');
  const [notes,setNotes]=useState(''); const [coupon,setCoupon]=useState(''); const [couponMessage,setCouponMessage]=useState('');
  const [pincode,setPincode]=useState(''); const [pinMessage,setPinMessage]=useState(''); const [busy,setBusy]=useState(false); const [done,setDone]=useState<string|null>(null);

  useEffect(()=>{ supabase.from('site_services').select('id,title,price').eq('is_published',true).order('display_order').then(({data})=>setServices(data??[])); },[]);
  const selected=useMemo(()=>services.find(s=>s.id===serviceId),[services,serviceId]);

  async function checkPin(){
    const {data,error}=await supabase.from('serviceable_pincodes').select('area').eq('pincode',pincode.replace(/\D/g,'')).maybeSingle();
    setPinMessage(error ? 'Could not check right now.' : data ? `✓ Service available${data.area?` in ${data.area}`:''}.` : 'We have not added this pincode yet. Please contact us on WhatsApp.');
  }
  async function checkCoupon(){
    if(!coupon){setCouponMessage('');return;}
    const {data,error}=await supabase.rpc('validate_coupon',{p_code:coupon,p_amount:1500});
    setCouponMessage(error ? 'Coupon check failed.' : data?.valid ? `✓ ${data.description || 'Coupon applied'}` : data?.message || 'Coupon unavailable.');
  }
  async function submit(e:React.FormEvent){
    e.preventDefault(); setBusy(true);
    try {
      if(!selected) throw new Error('Please select a service.');
      if(!/^\+?91?\d{10}$/.test(phone.replace(/[\s-]/g,''))) throw new Error('Enter a valid Indian mobile number.');
      const {data,error}=await supabase.from('bookings').insert({customer_name:name.trim(),phone:phone.trim(),email:email.trim()||null,service_id:selected.id,service_name:selected.title,appointment_date:date,appointment_time:time,notes:notes.trim(),coupon_code:coupon.trim().toUpperCase()||null}).select('booking_code').single();
      if(error) throw error;
      setDone(data.booking_code);
      void notifyBooking({bookingCode:data.booking_code,customerName:name,phone,email,serviceName:selected.title,date,time,notes});
    } catch(err){toast.error(err instanceof Error?err.message:'Booking failed');} finally{setBusy(false);}
  }
  if(done) return <div className="surface-panel rounded-sm p-8 text-center"><CheckCircle2 className="mx-auto h-10 w-10 text-gold"/><p className="eyebrow mt-5">Booking received</p><h3 className="mt-2 font-display text-3xl text-ivory">#{done}</h3><p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">We have received your appointment request. Our team will confirm the slot with you.</p><a className="mt-7 inline-flex items-center gap-2 rounded-sm bg-gold px-5 py-3 text-xs uppercase tracking-[0.18em] text-primary-foreground" href={whatsappLink('general',`Booking request ${done} — ${name}, ${selected?.title}, ${date} ${time}`)} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4"/> Continue on WhatsApp</a></div>;
  return <form onSubmit={submit} className="surface-panel rounded-sm p-6 md:p-8 space-y-5">
    <div className="grid gap-5 md:grid-cols-2"><label className="block"><span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">Name</span><input required minLength={2} value={name} onChange={e=>setName(e.target.value)} className={field}/></label><label className="block"><span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">Mobile</span><input required inputMode="tel" value={phone} onChange={e=>setPhone(e.target.value)} className={field}/></label></div>
    <div className="grid gap-5 md:grid-cols-2"><label className="block"><span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">Email (optional)</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className={field}/></label><label className="block"><span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">Service</span><select required value={serviceId} onChange={e=>setServiceId(e.target.value)} className={field}><option value="">Select a service</option>{services.map(s=><option key={s.id} value={s.id}>{s.title}{s.price?` — ${s.price}`:''}</option>)}</select></label></div>
    <div className="grid gap-5 md:grid-cols-2"><label className="block"><span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">Date</span><input required type="date" min={today()} value={date} onChange={e=>setDate(e.target.value)} className={field}/></label><label className="block"><span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">Preferred time</span><input required type="time" min="10:00" max="20:30" value={time} onChange={e=>setTime(e.target.value)} className={field}/></label></div>
    <div className="grid gap-5 md:grid-cols-2"><div><label className="block"><span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">Pincode</span><div className="flex gap-2"><input inputMode="numeric" maxLength={6} value={pincode} onChange={e=>setPincode(e.target.value.replace(/\D/g,''))} className={field}/><button type="button" onClick={checkPin} className="mt-2 rounded-sm border border-gold/40 px-4 text-xs text-ivory">Check</button></div></label>{pinMessage&&<p className="mt-2 text-xs text-muted-foreground">{pinMessage}</p>}</div><div><label className="block"><span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">Coupon</span><div className="flex gap-2"><input value={coupon} onChange={e=>setCoupon(e.target.value.toUpperCase())} className={field}/><button type="button" onClick={checkCoupon} className="mt-2 rounded-sm border border-gold/40 px-4 text-xs text-ivory">Apply</button></div></label>{couponMessage&&<p className="mt-2 text-xs text-muted-foreground">{couponMessage}</p>}</div></div>
    <label className="block"><span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">Notes</span><textarea rows={3} value={notes} onChange={e=>setNotes(e.target.value)} className={field} placeholder="Anything we should know?"/></label>
    <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-gold px-6 py-3 text-xs uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-60">{busy?<><Loader2 className="h-4 w-4 animate-spin"/>Sending</>:<><CalendarDays className="h-4 w-4"/>Request appointment</>}</button>
    <p className="flex items-start gap-2 text-xs text-muted-foreground"><MapPin className="mt-0.5 h-4 w-4 shrink-0"/>{BUSINESS.addressLine}</p>
  </form>;
}
