import { createFileRoute } from '@tanstack/react-router';
import { BookingForm } from '@/components/site/BookingForm';
import { BUSINESS } from '@/config/site';

export const Route = createFileRoute('/book')({
  head: () => ({ meta: [{title:`Book an Appointment | ${BUSINESS.name}`},{name:'description',content:`Book a salon appointment at ${BUSINESS.name} in Tiruppur.`}] }),
  component: BookingPage,
});
function BookingPage(){return <main className="min-h-screen bg-background px-5 pb-24 pt-32 md:px-8"><div className="mx-auto max-w-3xl"><p className="eyebrow">Appointments</p><h1 className="mt-4 font-display text-5xl text-ivory md:text-6xl">Book your visit.</h1><p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">Choose your service and preferred slot. Your request is saved securely and the Kaaras team will confirm it.</p><div className="mt-10"><BookingForm/></div></div></main>}
