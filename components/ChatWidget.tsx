"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

type Message = { id: string; message: string; is_admin: boolean; created_at: string; };

export default function ChatWidget({ userEmail }: { userEmail: string | null }) {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function fetchMessages(convId: string) {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    setMessages((data ?? []) as Message[]);
  }

  useEffect(() => {
    if (!showChat || !userEmail) return;
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      let { data: conv } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (!conv) {
        const { data: newConv } = await supabase
          .from("conversations")
          .insert([{ user_id: user.id, user_email: userEmail }])
          .select()
          .single();
        conv = newConv;
      }
      if (!conv) return;
      setConversationId(conv.id);
      fetchMessages(conv.id);
    };
    init();
  }, [showChat, userEmail]);

  useEffect(() => {
    if (!conversationId) return;
    const sub = supabase
      .channel(`chat:${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "chat_messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, () => fetchMessages(conversationId))
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSendMessage() {
    if (!newMessage.trim() || !conversationId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const text = newMessage.trim();
    setNewMessage("");
    await supabase.from("chat_messages").insert([{
      conversation_id: conversationId,
      sender_id: user.id,
      sender_email: userEmail,
      message: text,
      is_admin: false,
    }]);
    await supabase.from("conversations").update({
      last_message: text,
      last_message_at: new Date().toISOString(),
    }).eq("id", conversationId);
  }

  if (!userEmail || userEmail === "guest") return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setShowChat(v => !v)}
        style={{position:'fixed',bottom:'24px',right:'24px',zIndex:999,background:'linear-gradient(135deg,#e91e8c,#f06292)',color:'white',border:'none',borderRadius:'50px',padding:'14px 20px',fontWeight:'700',fontSize:'14px',cursor:'pointer',boxShadow:'0 6px 20px rgba(233,30,140,0.4)',display:'flex',alignItems:'center',gap:'8px'}}
      >
        💬 {showChat ? "Close" : "Message Seller"}
      </button>

      {/* Chat modal */}
      {showChat && (
        <div style={{position:'fixed',bottom:'84px',right:'24px',zIndex:1000,width:'340px',height:'480px',background:'white',borderRadius:'24px',boxShadow:'0 20px 60px rgba(0,0,0,0.2)',display:'flex',flexDirection:'column',overflow:'hidden'}}>
          {/* Header */}
          <div style={{background:'linear-gradient(135deg,#e91e8c,#f06292)',padding:'16px 20px',color:'white',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <p style={{fontWeight:'700',margin:0,fontSize:'15px'}}>Mae Little Loops Studio</p>
              <p style={{fontSize:'12px',margin:0,opacity:0.85}}>🟢 Online — We reply quickly!</p>
            </div>
            <button onClick={() => setShowChat(false)} style={{background:'none',border:'none',color:'white',fontSize:'20px',cursor:'pointer',lineHeight:1}}>✕</button>
          </div>

          {/* Messages */}
          <div style={{flex:1,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:'8px'}}>
            {messages.length === 0 && (
              <div style={{textAlign:'center',color:'#aaa',fontSize:'13px',marginTop:'40px'}}>
                <p style={{fontSize:'32px',marginBottom:'8px'}}>🌸</p>
                <p>Hi! How can we help you today?</p>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} style={{alignSelf:msg.is_admin ? 'flex-start' : 'flex-end',background:msg.is_admin ? '#fce4ec' : 'linear-gradient(135deg,#e91e8c,#f06292)',color:msg.is_admin ? '#333' : 'white',padding:'10px 14px',borderRadius:msg.is_admin ? '4px 12px 12px 12px' : '12px 4px 12px 12px',maxWidth:'78%',fontSize:'14px'}}>
                <p style={{margin:0}}>{msg.message}</p>
                <p style={{margin:'4px 0 0',fontSize:'11px',opacity:0.65}}>{new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</p>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{padding:'12px 16px',borderTop:'1px solid #fce4ec',display:'flex',gap:'8px',alignItems:'center'}}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
              placeholder="Type a message..."
              style={{flex:1,padding:'10px 14px',borderRadius:'50px',border:'1.5px solid #fce4ec',outline:'none',fontSize:'14px',fontFamily:'inherit'}}
            />
            <button
              onClick={handleSendMessage}
              style={{background:'linear-gradient(135deg,#e91e8c,#f06292)',border:'none',borderRadius:'50%',width:'40px',height:'40px',color:'white',cursor:'pointer',fontSize:'16px',flexShrink:0}}
            >➤</button>
          </div>
        </div>
      )}
    </>
  );
}
