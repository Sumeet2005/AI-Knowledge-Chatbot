import { useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import type { Source } from './MessageBubble';
import { useChat } from '../../context/ChatContext';

interface DrawerMetadata {
  latency?: number;
  retrieved_chunks?: number;
  conversation_id?: number | null;
  timestamp?: string;
}

export const ChatStream = ({
  onOpenDrawer,
}: {
  onOpenDrawer: (sources: Source[], metadata: DrawerMetadata) => void;
}) => {
  const { currentMessages, loadingChat, activeThreadId } = useChat();

  // ─── Refs ─────────────────────────────────────────────────────────────────── //

  /** The scrollable container. We only touch .scrollTop — never window, never scrollIntoView. */
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * True when the user has intentionally scrolled upward.
   * While true, streaming tokens do NOT auto-scroll the container.
   * Reset to false whenever a new outgoing message is submitted.
   */
  const userScrolledUp = useRef(false);

  /** Number of messages at the time of the last render we scrolled for. */
  const prevMsgCount = useRef(0);

  /**
   * Whether `loadingChat` was true on the previous render.
   * Used to detect the moment the skeleton placeholder appears.
   */
  const prevLoadingChat = useRef(false);

  // ─── Primitive helpers ────────────────────────────────────────────────────── //

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = containerRef.current;
    if (!el) return;
    if (behavior === 'instant') {
      el.scrollTop = el.scrollHeight;
    } else {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  /**
   * True when the user is within `threshold` px of the bottom.
   * We use 100px so there is a small tolerance before we stop auto-scrolling.
   */
  const isNearBottom = useCallback((threshold = 100) => {
    const el = containerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
  }, []);

  // ─── User scroll detection ────────────────────────────────────────────────── //

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      // Only update the flag when the event is from the user, not from our
      // programmatic scrollTo calls. We detect this by checking direction:
      // if they're now near the bottom, re-enable auto-scroll.
      userScrolledUp.current = !isNearBottom(100);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [isNearBottom]);

  // ─── Core scroll logic — runs AFTER every DOM commit, BEFORE paint ──────── //
  //
  // useLayoutEffect guarantees that scrollHeight already reflects the newly
  // inserted bubble/skeleton when we read it. This solves the "placeholder
  // appears below the viewport" problem that setTimeout(30ms) cannot fix.
  //
  // Decision table:
  //   NEW message added    → force scroll, reset userScrolledUp
  //   Skeleton appeared    → force scroll (same: user just sent a message)
  //   Streaming token      → scroll only if user is near bottom
  //   Thread switch        → handled by separate effect below

  useLayoutEffect(() => {
    const msgCount = currentMessages.length;
    const loadingJustStarted = loadingChat && !prevLoadingChat.current;
    const newMessageAdded = msgCount > prevMsgCount.current;

    // ── Case 1: New message added (user bubble) or skeleton just appeared ── //
    if (newMessageAdded || loadingJustStarted) {
      userScrolledUp.current = false;
      scrollToBottom('instant');
    }
    // ── Case 2: Streaming token on existing last message ─────────────────── //
    else if (!userScrolledUp.current) {
      scrollToBottom('smooth');
    }

    // Update trackers AFTER the scroll decision
    prevMsgCount.current = msgCount;
    prevLoadingChat.current = loadingChat;
  }, [currentMessages, loadingChat, scrollToBottom]);

  // ─── Thread switch — instant jump ─────────────────────────────────────────  //

  useLayoutEffect(() => {
    userScrolledUp.current = false;
    prevMsgCount.current = 0;
    prevLoadingChat.current = false;
    scrollToBottom('instant');
  }, [activeThreadId, scrollToBottom]);

  // ─── Derived render state ─────────────────────────────────────────────────  //

  const showSkeleton =
    loadingChat &&
    currentMessages.length > 0 &&
    currentMessages[currentMessages.length - 1].role === 'user';

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-6 py-6 select-text"
      style={{ overscrollBehavior: 'contain' }}
    >
      <div className="max-w-[760px] mx-auto w-full flex flex-col">
        {currentMessages.map((msg, index) => (
          <MessageBubble
            key={index}
            role={msg.role}
            content={msg.content}
            created_at={msg.created_at}
            sources={msg.sources}
            retrieved_chunks={msg.retrieved_chunks}
            response_time_ms={msg.response_time_ms}
            conversation_id={activeThreadId}
            onOpenDrawer={onOpenDrawer}
          />
        ))}

        {showSkeleton && (
          <MessageBubble
            role="assistant"
            content=""
            created_at={new Date().toISOString()}
            isLoading={true}
          />
        )}

        {/* Spacer — keeps last message from being flush against the input bar */}
        <div className="h-4 shrink-0" aria-hidden="true" />
      </div>
    </div>
  );
};

export default ChatStream;
