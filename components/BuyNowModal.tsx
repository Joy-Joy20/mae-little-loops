"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type Props = {
  product: { name: string; price: string; img: string | null } | null;
  onClose: () => void;
};

export default function BuyNowModal({ product, onClose }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [payment, setPayment] = useState("cod");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);

  if (!product) return null;

  const price = parseFloat(product.price.replace("₱", "").replace(",", ""));

  async function handleReceiptUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from("receipts").upload(fileName, file);
    if (!error && data) {
      const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(data.path);
      setReceiptUrl(urlData.publicUrl);
    }
    setUploading(false);
  }

  async function handlePlaceOrder() {
    if (!product) return;
    setPlacing(true);
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user?.id;
    const userEmail = session.session?.user?.email;

    const { data: order } = await supabase.from("orders").insert([{
      user_id: userId,
      user_email: userEmail,
      total_amount: price,
      status: "pending",
      name, address, phone,
      payment: payment === "gcash" ? "GCash" : "Cash on Delivery",
      receipt_url: receiptUrl ?? null,
    }]).select().single();

    if (order) {
      await supabase.from("order_items").insert([{
        order_id: order.id,
        product_name: product.name,
        price: product.price,
        quantity: 1,
        img: product.img ?? null,
      }]);
    }

    setPlacing(false);
    setPlaced(true);
    setTimeout(() => { onClose(); }, 3000);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        {placed ? (
          <div className="modal-success">
            <div style={{fontSize:'48px'}}>✅</div>
            <h2>Order placed successfully! 🌸</h2>
            <p>Thank you for your purchase. We will contact you shortly.</p>
            <p style={{fontSize:'13px', color:'#aaa', marginTop:'8px'}}>This will close automatically...</p>
          </div>
        ) : (
          <>
            <div className="modal-product">
              {product.img && <Image src={product.img} alt={product.name} width={80} height={80} style={{borderRadius:'12px', objectFit:'contain'}} />}
              <div>
                <p className="modal-product-name">{product.name}</p>
                <p className="modal-product-price">{product.price}</p>
              </div>
            </div>

            <div className="modal-steps">
              {["Delivery", "Payment", "Confirm"].map((label, i) => (
                <div key={i} style={{display:'flex', alignItems:'center', gap:'6px'}}>
                  <div className={`modal-step ${step >= i + 1 ? "active" : ""}`}>{i + 1}. {label}</div>
                  {i < 2 && <div className="modal-step-line" />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="modal-form">
                <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
                <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <button className="modal-btn" onClick={() => setStep(2)} disabled={!name || !address || !phone}>Next →</button>
              </div>
            )}

            {step === 2 && (
              <div className="modal-form">
                <label className={`modal-payment ${payment === "cod" ? "selected" : ""}`}>
                  <input type="radio" name="pay" checked={payment === "cod"} onChange={() => setPayment("cod")} />
                  💵 Cash on Delivery
                </label>
                <label className={`modal-payment ${payment === "gcash" ? "selected" : ""}`}>
                  <input type="radio" name="pay" checked={payment === "gcash"} onChange={() => setPayment("gcash")} />
                  📱 GCash
                </label>
                {payment === "gcash" && (
                  <div className="modal-gcash">
                    <img src="/gcash-qr.png" alt="GCash QR" style={{width:'140px', borderRadius:'8px', border:'1px solid #fce4ec'}} />
                    <p style={{fontSize:'12px', color:'#888', textAlign:'center'}}>Scan to pay ₱{price.toFixed(2)}</p>
                    <input type="file" accept="image/*" onChange={handleReceiptUpload} />
                    {uploading && <p style={{fontSize:'12px', color:'#aaa'}}>Uploading...</p>}
                    {receiptUrl && <p style={{fontSize:'12px', color:'#66bb6a'}}>✅ Receipt uploaded!</p>}
                  </div>
                )}
                <div style={{display:'flex', gap:'10px'}}>
                  <button className="modal-btn-outline" onClick={() => setStep(1)}>← Back</button>
                  <button className="modal-btn" onClick={() => setStep(3)} disabled={payment === "gcash" && !receiptUrl}>Next →</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="modal-form">
                <div className="modal-confirm-row"><span>Product</span><span>{product.name}</span></div>
                <div className="modal-confirm-row"><span>Price</span><span>{product.price}</span></div>
                <div className="modal-confirm-row"><span>Name</span><span>{name}</span></div>
                <div className="modal-confirm-row"><span>Address</span><span>{address}</span></div>
                <div className="modal-confirm-row"><span>Phone</span><span>{phone}</span></div>
                <div className="modal-confirm-row"><span>Payment</span><span>{payment === "gcash" ? "GCash" : "Cash on Delivery"}</span></div>
                <div style={{display:'flex', gap:'10px'}}>
                  <button className="modal-btn-outline" onClick={() => setStep(2)}>← Back</button>
                  <button className="modal-btn" onClick={handlePlaceOrder} disabled={placing}>{placing ? "Placing..." : "Place Order"}</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
