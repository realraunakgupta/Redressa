"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { CommunicationThreadRow, OutboundMessageRow, InboundMessageRow } from "@/lib/supabase/types";

interface CommunicationPanelProps {
  threads: CommunicationThreadRow[];
  messages: OutboundMessageRow[];
  inboundMessages: InboundMessageRow[];
  hasGmail: boolean;
  caseId: string;
}

export function CommunicationPanel({ threads, messages, inboundMessages, hasGmail, caseId }: CommunicationPanelProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [editedTo, setEditedTo] = useState<string | null>(null);
  const [editedSubject, setEditedSubject] = useState<string | null>(null);
  const [editedBody, setEditedBody] = useState<string | null>(null);
  
  const activeThread = threads.length > 0 ? threads[0] : null;
  const activeMessage = activeThread ? messages.find(m => m.thread_id === activeThread.id) : null;
  const [localStatus, setLocalStatus] = useState<string | null>(activeMessage?.status || null);
  const [localMode, setLocalMode] = useState<string>(activeThread?.automation_mode || "manual");

  useEffect(() => {
    if (activeMessage?.status) {
      setLocalStatus(activeMessage.status);
    }
  }, [activeMessage?.status]);

  useEffect(() => {
    if (activeThread?.automation_mode) {
      setLocalMode(activeThread.automation_mode);
    }
  }, [activeThread?.automation_mode]);

  const router = useRouter();

  const formatTimestamp = (value: string | null) => {
    if (!value) return "";

    return new Date(value).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    });
  };

  const getReplyLabel = (category: string | null) => {
    switch (category) {
      case "resolved": return "Resolved";
      case "partial_resolution": return "Partial Resolution";
      case "stalling": return "Stalling";
      case "asking_for_info": return "Request for Information";
      case "rejecting_liability": return "Rejecting Liability";
      case "escalating_internally": return "Escalated Internally";
      case "unclear": return "Unclear Response";
      default: return category ? category.replace(/_/g, " ") : "Unknown";
    }
  };

  const getErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : "Unexpected error";

  const handleConnectGmail = async () => {
    setIsConnecting(true);
    setSendError(null);
    try {
      const resp = await fetch("/api/auth/gmail/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ next: `/case/${caseId}` })
      });
      
      if (!resp.ok) {
        if (resp.status === 401) {
          // User entirely unauthenticated or session expired; force standard login
          window.location.href = `/login?next=${encodeURIComponent(`/case/${caseId}`)}`;
          return;
        }
        throw new Error("Failed to connect");
      }
      
      const data = await resp.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setSendError("Could not initiate Gmail connection.");
      setIsConnecting(false);
    }
  };

  const handleApproveAndSend = async (messageId: string, threadId: string) => {
    setIsSending(true);
    setSendError(null);
    try {
      const isDemoThread = threadId.startsWith("demo-");
      const finalToAddress = editedTo !== null ? editedTo : messages.find(m => m.id === messageId)?.to_address;
      const finalSubject = editedSubject !== null ? editedSubject : messages.find(m => m.id === messageId)?.subject;
      const finalBody = editedBody !== null ? editedBody : messages.find(m => m.id === messageId)?.body;
      
      const resp = await fetch("/api/communication/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message_id: messageId, 
          thread_id: threadId, 
          to_address: finalToAddress,
          subject: finalSubject,
          body: finalBody
        })
      });
      
      const data = await resp.json();
      
      if (!resp.ok) {
        if (resp.status === 401) {
          window.location.href = `/login?next=${encodeURIComponent(`/case/${caseId}`)}`;
          return;
        }
        if (data.code === "GMAIL_NOT_CONNECTED") {
           // Should not happen if UI is consistent, but just in case
           handleConnectGmail();
           return;
        }
        throw new Error(data.error || "Failed to send message");
      }
      
      // Successfully sent, update local state immediately and refresh server state
      setLocalStatus("sent");
      if (!isDemoThread) {
        router.refresh();
      }
      setIsSending(false);
      
    } catch (err: unknown) {
      setSendError(getErrorMessage(err) || "Failed to send email");
      setIsSending(false);
    }
  };

  const handleSyncReplies = async (threadId: string) => {
    setIsSyncing(true);
    setSendError(null);
    try {
      const resp = await fetch("/api/communication/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thread_id: threadId })
      });
      if (!resp.ok) throw new Error("Failed to sync replies");
      
      // Refresh page to fetch new replies state
      router.refresh();
      setIsSyncing(false);
    } catch (err: unknown) {
      setSendError(getErrorMessage(err) || "Failed to sync emails");
      setIsSyncing(false);
    }
  };

  const handleToggleMode = async (threadId: string, currentMode: string) => {
    setIsToggling(true);
    setSendError(null);
    const modeOrder = ["manual", "assisted", "autopilot"] as const;
    const currentIndex = modeOrder.indexOf(
      (currentMode === "manual" || currentMode === "assisted" || currentMode === "autopilot")
        ? currentMode
        : "manual"
    );
    const newMode = modeOrder[(currentIndex + 1) % modeOrder.length];
    
    try {
      if (threadId.startsWith("demo-")) {
        await new Promise(r => setTimeout(r, 600));
        setLocalMode(newMode);
        setIsToggling(false);
        return;
      }

      const resp = await fetch("/api/communication/toggle-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thread_id: threadId, mode: newMode })
      });
      if (!resp.ok) throw new Error("Failed to change mode");
      setLocalMode(newMode);
      router.refresh();
      setIsToggling(false);
    } catch (err: unknown) {
      setSendError(getErrorMessage(err) || "Failed to change automation mode");
      setIsToggling(false);
    }
  };

  if (threads.length === 0) {
    return null;
  }

  if (!activeMessage || !activeThread) {
    return null;
  }

  const isSent = localStatus === "sent";
  const followUpDrafts = messages.filter(m => 
    m.thread_id === activeThread.id && 
    m.generation_source === "ai_followup" && 
    (m.status === "draft" || m.status === "approved")
  );
  const latestFollowup = followUpDrafts[followUpDrafts.length - 1];
  
  const sentFollowups = messages.filter(m => 
    m.thread_id === activeThread.id && 
    m.id !== activeMessage.id && 
    m.status === "sent"
  );
  const latestInbound = inboundMessages.length > 0 ? inboundMessages[inboundMessages.length - 1] : null;
  const isPaused = activeThread.state === "needs_user_input";

  const ExpandableMessageBody = ({ body }: { body: string }) => {
    const [expanded, setExpanded] = useState(false);
    return (
      <div className="mt-2">
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors flex items-center mb-1"
        >
          {expanded ? (
            <><svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg> Hide Message Body</>
          ) : (
             <><svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg> Show Message Body</>
          )}
        </button>
        {expanded && (
          <div className="text-sm text-neutral-300 whitespace-pre-wrap mt-2 pr-2 custom-scrollbar bg-neutral-950/50 p-3 rounded-md border border-neutral-800 break-words">
            {body}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-sm border border-[var(--color-border-solid)] bg-surface p-6 sm:p-8 shadow-sm overflow-hidden relative mt-8">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-6 border-b border-[var(--color-border-ghost)] pb-4 gap-4">
        <div className="flex-1 min-w-0 pr-4">
          <h2 className="text-sm font-serif font-bold uppercase tracking-widest text-primary truncate">Communication & Escalation</h2>
          <p className="text-[10px] font-sans font-medium uppercase tracking-wider text-on-surface-muted/60 mt-1 truncate">
            {isSent 
               ? `Successfully escalated to ${activeThread.target_name}` 
               : `Ready to escalate to ${activeThread.target_name}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
            {isSent && hasGmail && !activeThread.id.startsWith("demo-") && (
               <button 
                  onClick={() => handleSyncReplies(activeThread.id)}
                  disabled={isSyncing}
                  className="px-4 py-1.5 text-[10px] font-sans font-bold uppercase tracking-widest rounded-sm bg-surface-low text-on-surface-muted hover:border-[var(--color-border-solid)] border border-[var(--color-border-ghost)] transition-colors disabled:opacity-50"
               >
                  {isSyncing ? "Syncing..." : "Sync Replies"}
               </button>
            )}
            {(isSent || activeThread.id.startsWith("demo-")) && (
               <button 
                  onClick={() => handleToggleMode(activeThread.id, localMode)}
                  disabled={isToggling}
                  className={`px-4 py-1.5 text-[10px] font-sans font-bold uppercase tracking-widest rounded-sm border transition-colors disabled:opacity-50 ${
                     localMode === "autopilot" 
                        ? "border-[var(--color-success)]/40 bg-[var(--color-success)]/5 text-[var(--color-success)]"
                        : localMode === "assisted"
                           ? "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5 text-primary"
                        : "border-[var(--color-border-solid)] bg-surface text-primary"
                  }`}
                  title="Click to cycle between Manual, Assisted, and Autopilot modes"
               >
                  {isToggling ? "Updating..." : `${localMode} Mode`}
               </button>
            )}
        </div>
      </div>

      {/* Outbound Message */}
      <div className="bg-base rounded-sm border border-[var(--color-border-ghost)] p-5 mb-6">
        <div className="text-sm border-b border-[var(--color-border-ghost)] pb-3 mb-3">
          <div className="flex items-center mb-2 group">
             <label htmlFor="to-input" className="text-[0.65rem] font-sans font-bold uppercase tracking-widest text-on-surface-muted/80 w-24 shrink-0 cursor-pointer">To</label>
             <input 
                id="to-input"
                type="text" 
                value={editedTo !== null ? editedTo : activeMessage.to_address}
                onChange={(e) => setEditedTo(e.target.value)}
                disabled={isSent || isSending}
                className="flex-1 min-w-0 bg-transparent border-b border-transparent hover:border-[var(--color-border-ghost)] focus:border-primary focus:outline-none text-sm font-sans font-medium text-on-base transition-colors px-1 py-0.5 truncate"
                placeholder="recipient@example.com"
             />
          </div>
          <div className="flex items-center group">
             <label htmlFor="subject-input" className="text-[0.65rem] font-sans font-bold uppercase tracking-widest text-on-surface-muted/80 w-24 shrink-0 cursor-pointer">Subject</label>
             <input 
                id="subject-input"
                type="text" 
                value={editedSubject !== null ? editedSubject : activeMessage.subject}
                onChange={(e) => setEditedSubject(e.target.value)}
                disabled={isSent || isSending}
                className="flex-1 min-w-0 bg-transparent border-b border-transparent hover:border-[var(--color-border-ghost)] focus:border-primary focus:outline-none text-sm font-sans font-bold text-on-base transition-colors px-1 py-0.5 truncate"
             />
          </div>
        </div>
        <div className="text-sm text-on-base pr-2">
          <textarea
             value={editedBody !== null ? editedBody : activeMessage.body}
             onChange={(e) => setEditedBody(e.target.value)}
             disabled={isSent || isSending}
             className="w-full bg-transparent resize-none focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface-low rounded p-2 transition-colors min-h-[160px] break-words whitespace-pre-wrap font-serif text-sm leading-loose text-on-surface-muted"
          />
        </div>
      </div>

      {/* Inbound Replies */}
      {inboundMessages.map(reply => (
        <div key={reply.id} className="bg-surface-low rounded border border-[var(--color-border-ghost)] p-5 mb-6 relative ml-4 md:ml-8 mt-4 shadow-sm">
           <div className="absolute -left-4 md:-left-8 top-8 w-4 md:w-8 border-t-[1.5px] border-l-[1.5px] border-[var(--color-border-ghost)] h-full rounded-tl-sm pointer-events-none" />
           <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-4 border-b border-[var(--color-border-ghost)] pb-4 gap-3">
              <div className="flex-1 min-w-0">
                 <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-on-surface-muted/70 truncate">Reply from {reply.from_address}</div>
                 <div className="text-sm font-sans font-bold text-on-base mt-2 break-words line-clamp-2">{reply.subject}</div>
              </div>
              <div className="sm:text-right shrink-0">
                 {reply.classification_category && (
                    <span className="px-2.5 py-1 bg-surface border border-[var(--color-border-solid)] text-primary text-[9px] font-sans font-bold uppercase tracking-widest rounded-sm inline-block sm:relative sm:-top-1 mb-2 sm:mb-0">
                       {getReplyLabel(reply.classification_category)}
                    </span>
                 )}
                 <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface-muted/50 sm:mt-2">
                    {formatTimestamp(reply.received_at)}
                 </div>
              </div>
           </div>
           {reply.classification_reason && (
              <div className="mb-4 text-xs font-sans text-on-surface-muted leading-relaxed bg-base p-4 rounded-sm border border-[var(--color-border-ghost)] shadow-inner break-words">
                 <span className="font-bold text-primary block text-[9px] uppercase tracking-widest mb-1.5">System Parsing</span> {reply.classification_reason}
              </div>
           )}
           <ExpandableMessageBody body={reply.body} />
        </div>
      ))}

      {/* Sent Follow-Ups */}
      {sentFollowups.map(followup => {
         const isAutopilot = followup.approved_by === "system_autopilot";
         return (
           <div key={followup.id} className="bg-neutral-900 rounded border border-neutral-800 p-4 mb-4 relative ml-4 md:ml-8 mt-2">
             <div className="absolute -left-3 top-6 w-3 border-t border-l border-neutral-700 h-full rounded-tl-lg pointer-events-none" />
             <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-2 border-b border-neutral-800 pb-2 gap-2">
                <div className="flex-1 min-w-0">
                   <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-neutral-400 truncate">Sent to {followup.to_address}</span>
                      {isAutopilot ? (
                         <span className="px-2 py-0.5 bg-primary-950 text-primary-400 border border-primary-900 text-[10px] rounded font-bold tracking-wider uppercase flex items-center gap-1 shrink-0">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Dispatched via Autopilot
                         </span>
                      ) : (
                         <span className="px-2 py-0.5 bg-neutral-800 text-neutral-300 border border-neutral-700 text-[10px] rounded font-bold tracking-wider uppercase shrink-0">
                            Sent via Assisted Mode
                         </span>
                      )}
                   </div>
                   <div className="text-sm font-medium text-neutral-200 break-words line-clamp-2">{followup.subject}</div>
                </div>
                <div className="sm:text-right shrink-0">
                   <div className="text-[11px] text-neutral-500 mt-1 sm:mt-0">
                      {formatTimestamp(followup.sent_at)}
                   </div>
                </div>
             </div>
             <ExpandableMessageBody body={followup.body} />
           </div>
         );
      })}

      {/* Paused Banner */}
      {isPaused && latestInbound && (
        <div className="mb-4 bg-error-950/40 border border-error-800 text-error-300 text-sm px-4 py-3 rounded-lg flex items-start gap-3 relative overflow-hidden">
           <div className="absolute left-0 top-0 bottom-0 w-1 bg-error-600"></div>
           <svg className="w-5 h-5 shrink-0 mt-0.5 text-error-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
           </svg>
           <div>
              <div className="font-bold text-error-400 mb-1">System Paused</div>
              Following policy rules, Autopilot was paused because the merchant response requires human decision ({getReplyLabel(latestInbound.classification_category)}). Please review the reply above.
           </div>
        </div>
      )}

      {/* Recommended Followup Draft */}
      {latestFollowup && (
        <div className="bg-primary-950/40 rounded-lg border border-primary-800 p-5 mb-4 shadow-sm relative">
           <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold tracking-tight text-primary-400 flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 {latestFollowup.status === "approved" ? "Autopilot Engine Has Drafted Pushback" : "Recommended Followup Action"}
              </h3>
              <span className="text-xs font-medium text-primary-500/80 bg-primary-950 px-2 py-0.5 rounded border border-primary-800">
                 Draft ID: {latestFollowup.id.split('-')[0]}
              </span>
           </div>
           
           <div className="text-sm text-neutral-300 whitespace-pre-wrap max-h-60 overflow-y-auto pr-2 custom-scrollbar p-3 bg-neutral-900/50 rounded border border-neutral-800">
              {latestFollowup.body}
           </div>
           
           <div className="mt-4 flex justify-end">
              <button
                 onClick={() => handleApproveAndSend(latestFollowup.id, activeThread.id)}
                 disabled={isSending}
                 className={`bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm px-6 py-2 rounded flex items-center transition-colors shadow-sm shadow-primary-900/50 ${latestFollowup.status === "approved" ? "animate-pulse border-primary-400" : ""}`}
              >
                 {isSending 
                    ? "Sending Action..." 
                    : latestFollowup.status === "approved" 
                       ? "Autopilot Queued (Dispatching...)" 
                       : "Approve & Send Follow-up"}
              </button>
           </div>
        </div>
      )}

      {/* Controls */}
      {sendError && (
        <div className="mb-4 bg-error-900/30 border border-error-800 text-error-400 text-sm px-4 py-2 rounded">
          {sendError}
        </div>
      )}

      <div className="flex justify-end pt-2">
          {isSent || activeThread.id.startsWith("demo-") ? (
             <div className="flex items-center text-success-500 text-sm font-medium">
                <svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {activeThread.id.startsWith("demo-") ? "Sent via Agent" : "Sent via Gmail"}
             </div>
          ) : !hasGmail ? (
             <button
                onClick={handleConnectGmail}
                disabled={isConnecting}
                className="btn-primary text-[10px] sm:text-xs py-2 px-6 flex items-center transition-all disabled:opacity-70 disabled:cursor-not-allowed"
             >
                {isConnecting ? (
                   "Connecting..."
                ) : (
                   <>
                      <svg className="w-3.5 h-3.5 mr-2 opacity-80" viewBox="0 0 24 24">
                         <path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.2,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.1,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.36,22 12.22,22C17.05,22 21.5,18.33 21.5,12.91C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z" />
                      </svg>
                      Connect Gmail to Send
                   </>
                )}
             </button>
          ) : (
             <button
                onClick={() => handleApproveAndSend(activeMessage.id, activeThread.id)}
                disabled={isSending}
                className="btn-primary text-[10px] sm:text-xs py-2.5 px-6 flex items-center transition-all disabled:opacity-70 disabled:cursor-not-allowed"
             >
                {isSending ? (
                   <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                   </>
                ) : (
                   "Approve & Send via Gmail"
                )}
             </button>
          )}
      </div>
    </div>
  );
}
