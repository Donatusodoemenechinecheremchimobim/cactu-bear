"use client";
import { useStore } from '@/store/useStore';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { useRouter } from 'next/navigation';

export default function Checkout() {
  const { cart, clearCart } = useStore();
  const { data: session } = useSession();
  const router = useRouter();
  const total = cart.reduce((acc, item) => acc + item.price, 0);

  const [details, setDetails] = useState({ name: '', email: '', phone: '' });

  // FLUTTERWAVE CONFIG
  const config = {
    public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_KEY || 'FLWPUBK_TEST-SANDBOX', // Use your key
    tx_ref: Date.now().toString(),
    amount: total,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: details.email || session?.user?.email || 'guest@example.com',
      phone_number: details.phone,
      name: details.name || session?.user?.name || 'Guest',
    },
    customizations: {
      title: 'Cactus Bear Store',
      description: 'Payment for Tactical Gear',
      logo: 'https://cdn-icons-png.flaticon.com/512/25/25231.png', // Replace with your logo
    },
  };

  const handleFlutterwavePayment = useFlutterwave(config);

  const processPayment = () => {
    if (!details.phone || !details.name) return alert("Please fill in contact details.");
    
    handleFlutterwavePayment({
      callback: (response) => {
        console.log(response);
        closePaymentModal();
        if (response.status === "successful") {
            // GENERATE WHATSAPP MESSAGE
            const orderId = response.tx_ref;
            const itemsList = cart.map(i => `₦{i.name} (₦{i.size})`).join(', ');
            const message = `🚨 NEW ORDER ALERT 🚨%0A%0AID: ₦{orderId}%0AName: ₦{details.name}%0AItems: ₦{itemsList}%0ATotal: ₦{total}%0AStatus: PAID (Flutterwave)`;
            
            // Redirect to WhatsApp
            const whatsappUrl = `https://wa.me/2349000000000?text=₦{message}`; // REPLACE NUMBER
            
            clearCart();
            window.location.href = whatsappUrl;
        }
      },
      onClose: () => {},
    });
  };

  if (cart.length === 0) return <div className="min-h-screen pt-32 text-center text-white">CART EMPTY</div>;

  return (
    <div className="min-h-screen pt-32 px-6 bg-black text-white flex justify-center">
        <div className="max-w-md w-full">
            <h1 className="text-3xl font-black uppercase italic mb-8 border-b border-white/20 pb-4">Secure Checkout</h1>
            
            <div className="space-y-4 mb-8">
                <input placeholder="Full Name" className="w-full bg-[#0a0a0a] border border-white/20 p-4 outline-none focus:border-brand-neon" value={details.name} onChange={e => setDetails({...details, name: e.target.value})} />
                <input placeholder="Email" className="w-full bg-[#0a0a0a] border border-white/20 p-4 outline-none focus:border-brand-neon" value={details.email} onChange={e => setDetails({...details, email: e.target.value})} />
                <input placeholder="Phone (Required for Delivery)" className="w-full bg-[#0a0a0a] border border-white/20 p-4 outline-none focus:border-brand-neon" value={details.phone} onChange={e => setDetails({...details, phone: e.target.value})} />
            </div>

            <div className="bg-[#111] p-6 mb-8 border border-white/10">
                <div className="flex justify-between mb-2 text-white/60"><span>Subtotal</span><span>₦{total}</span></div>
                <div className="flex justify-between mb-4 text-white/60"><span>Shipping</span><span>FREE</span></div>
                <div className="flex justify-between text-xl font-bold text-brand-neon border-t border-white/10 pt-4"><span>Total</span><span>₦{total}.00</span></div>
            </div>

            <button onClick={processPayment} className="w-full bg-brand-neon text-black py-4 font-black uppercase tracking-widest hover:bg-white transition-colors">
                Pay Now
            </button>
            <p className="text-[10px] text-center mt-4 text-white/30 uppercase">Secured by Flutterwave. Receipt sent to WhatsApp.</p>
        </div>
    </div>
  );
}