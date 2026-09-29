"use client";

import { useState, useTransition, useMemo } from "react";
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable
} from "@dnd-kit/core";
import { 
  SortableContext, 
  useSortable, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TrackedOpportunityItem, ApplicationStatus, updateApplicationStatus } from "@/actions/opportunities";
import { 
  Clock, 
  Sparkles, 
  ExternalLink, 
  MoreVertical, 
  Calendar, 
  CheckSquare, 
  FileText, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Share2,
  CalendarPlus,
  Edit3
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";

export interface KanbanColumn {
  id: ApplicationStatus;
  title: string;
  description: string;
  badgeColor: string;
}

function getDeadlineBadge(daysLeft: number) {
  if (daysLeft < 3) {
    return {
      text: daysLeft <= 0 ? "Дедлайн сегодня" : `${daysLeft} дн. осталось`,
      className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-bold animate-pulse"
    };
  }
  if (daysLeft < 14) {
    return {
      text: `${daysLeft} дн. осталось`,
      className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-semibold"
    };
  }
  return {
    text: `${daysLeft} дн. осталось`,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium"
  };
}

function makeGoogleCalendarUrl(title: string, deadlineDate: string, organizer: string, link: string) {
  const dateObj = new Date(deadlineDate);
  const start = dateObj.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const end = new Date(dateObj.getTime() + 3600000).toISOString().replace(/-|:|\.\d\d\d/g, "");
  const details = `Дедлайн подачи заявки на программу: ${title}\nОрганизатор: ${organizer}\nПодать заявку: ${link}\nОтслеживается через Wintality EdTech.`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("[Дедлайн] " + title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(organizer)}`;
}

// Droppable Column Component
function KanbanColumnDroppable({
  column,
  items,
  onOpenDetails,
  emptyText = "Перетащите карточку сюда"
}: {
  column: KanbanColumn;
  items: TrackedOpportunityItem[];
  onOpenDetails: (item: TrackedOpportunityItem) => void;
  emptyText?: string;
}) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-3 min-h-[460px] transition-colors"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1 border-b border-zinc-200/60 dark:border-zinc-800/60 mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border font-bold ${column.badgeColor}`}>
            {column.title}
          </span>
          <span className="text-xs font-mono font-semibold text-zinc-400">
            {items.length}
          </span>
        </div>
      </div>

      {/* Sortable Cards List */}
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2.5">
          {items.map((item) => (
            <KanbanCard
              key={item.id}
              item={item}
              onOpenDetails={() => onOpenDetails(item)}
            />
          ))}

          {items.length === 0 && (
            <div className="h-32 border-2 border-dashed border-zinc-200 dark:border-zinc-800/80 rounded-xl flex flex-col items-center justify-center text-center p-3 text-zinc-400">
              <span className="text-xs">{emptyText}</span>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// Draggable Sortable Card
function KanbanCard({
  item,
  onOpenDetails,
  isOverlay = false
}: {
  item: TrackedOpportunityItem;
  onOpenDetails?: () => void;
  isOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { item }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const badge = getDeadlineBadge(item.opportunity.daysLeft);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:border-zinc-400 dark:hover:border-zinc-700 transition-all cursor-grab active:cursor-grabbing select-none ${
        isOverlay ? "shadow-xl ring-2 ring-blue-500 scale-105" : ""
      }`}
    >
      <div className="space-y-2">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[140px]">
            {item.opportunity.organizer}
          </span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${badge.className}`}>
            {badge.text}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
          {item.opportunity.title}
        </h4>

        {/* Tags */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
            {item.opportunity.scope === "kazakhstan" ? "🇰🇿 РК" : "🌍 Global"}
          </span>
          {item.personalNotes && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center gap-1 font-medium">
              <FileText className="w-2.5 h-2.5" />
              <span>Заметка</span>
            </span>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <span className="text-[10px] text-zinc-400">
            Дедлайн: {item.opportunity.deadlineDate}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails?.();
            }}
            className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>Детали</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Interactive Kanban Board
export function KanbanBoard({
  initialItems
}: {
  initialItems: TrackedOpportunityItem[];
}) {
  const { t } = useLanguage();
  const [items, setItems] = useState<TrackedOpportunityItem[]>(initialItems);
  const [activeItem, setActiveItem] = useState<TrackedOpportunityItem | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<TrackedOpportunityItem | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    essay: false,
    transcript: false,
    recommendation: false,
    ielts: false
  });
  const [isPending, startTransition] = useTransition();

  const columns: KanbanColumn[] = useMemo(() => [
    {
      id: "interested",
      title: t.card.statusInterested || "Отслеживаю",
      description: "Интересные программы",
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
    },
    {
      id: "preparing",
      title: t.card.statusPreparing || "Готовлю заявку",
      description: "Сбор документов",
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
    },
    {
      id: "applied",
      title: t.card.statusApplied || "Подано",
      description: "Документы отправлены",
      badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
    },
    {
      id: "result_received",
      title: t.card.statusAccepted || "Результат",
      description: "Оффер или решение",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
    }
  ], [t]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const columnsMap = useMemo(() => {
    const map: Record<ApplicationStatus, TrackedOpportunityItem[]> = {
      interested: [],
      preparing: [],
      applied: [],
      result_received: [],
      saved: [],
      in_progress: [],
      submitted: [],
      accepted: [],
      rejected: []
    };

    items.forEach((item) => {
      // Normalize statuses into 4 main columns
      let colKey: ApplicationStatus = "interested";
      if (item.status === "interested" || item.status === "saved") colKey = "interested";
      else if (item.status === "preparing" || item.status === "in_progress") colKey = "preparing";
      else if (item.status === "applied" || item.status === "submitted") colKey = "applied";
      else colKey = "result_received";

      map[colKey].push(item);
    });

    return map;
  }, [items]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const found = items.find((i) => i.id === active.id);
    if (found) setActiveItem(found);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const currentItem = items.find((i) => i.id === activeId);
    if (!currentItem) return;

    // Check if dropped onto a column or onto another card
    let targetStatus: ApplicationStatus | null = null;
    if (columns.some((c) => c.id === overId)) {
      targetStatus = overId as ApplicationStatus;
    } else {
      const overItem = items.find((i) => i.id === overId);
      if (overItem) {
        targetStatus = overItem.status;
      }
    }

    if (targetStatus && targetStatus !== currentItem.status) {
      // Optimistic update
      const prevItems = [...items];
      const updated = items.map((i) =>
        i.id === activeId ? { ...i, status: targetStatus! } : i
      );
      setItems(updated);

      toast.success(`Перемещено в «${columns.find((c) => c.id === targetStatus)?.title}»`);

      // Persist to Server Action
      startTransition(async () => {
        try {
          const res = await updateApplicationStatus(
            currentItem.opportunityId,
            targetStatus!,
            currentItem.personalNotes
          );
          if (!res.success) {
            setItems(prevItems);
            toast.error("Не удалось сохранить статус на сервере");
          }
        } catch {
          setItems(prevItems);
          toast.error("Ошибка сохранения статуса");
        }
      });
    }
  };

  const handleOpenDetailsModal = (item: TrackedOpportunityItem) => {
    setSelectedDetails(item);
    setNotesDraft(item.personalNotes || "");
    // Parse notes JSON if formatted with checklist
    if (item.personalNotes && item.personalNotes.startsWith("{")) {
      try {
        const parsed = JSON.parse(item.personalNotes);
        setNotesDraft(parsed.text || "");
        if (parsed.checklist) setChecklist(parsed.checklist);
      } catch {
        setNotesDraft(item.personalNotes);
      }
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedDetails) return;
    const notesPayload = JSON.stringify({
      text: notesDraft,
      checklist
    });

    const updated = items.map((i) =>
      i.id === selectedDetails.id ? { ...i, personalNotes: notesDraft } : i
    );
    setItems(updated);
    toast.success("Заметки и чеклист документов сохранены");

    startTransition(async () => {
      await updateApplicationStatus(selectedDetails.opportunityId, selectedDetails.status, notesPayload);
    });

    setSelectedDetails(null);
  };

  return (
    <div className="space-y-4">
      {/* Board Layout */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((column) => (
            <KanbanColumnDroppable
              key={column.id}
              column={column}
              items={columnsMap[column.id] || []}
              onOpenDetails={handleOpenDetailsModal}
              emptyText={t.dashboard.dragCardHere}
            />
          ))}
        </div>

        {/* Drag Overlay for smooth animation */}
        <DragOverlay>
          {activeItem ? (
            <KanbanCard item={activeItem} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Card Details & Documents Checklist Modal */}
      {selectedDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-blue-600 dark:text-blue-400 font-semibold block">
                  {selectedDetails.opportunity.organizer}
                </span>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  {selectedDetails.opportunity.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetails(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Checklist */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                Чеклист готовности документов:
              </label>
              <div className="space-y-1.5">
                {[
                  { key: "essay", label: "Мотивационное эссе / Statement of Purpose" },
                  { key: "transcript", label: "Школьный табель оценок / Официальный транскрипт" },
                  { key: "recommendation", label: "Рекомендательное письмо преподавателя" },
                  { key: "ielts", label: "Языковой сертификат (IELTS 6.5+ / Duolingo / ЕНТ)" }
                ].map((task) => (
                  <label
                    key={task.key}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={!!checklist[task.key]}
                      onChange={(e) =>
                        setChecklist((prev) => ({ ...prev, [task.key]: e.target.checked }))
                      }
                      className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span className={checklist[task.key] ? "line-through opacity-70" : ""}>
                      {task.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Personal Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                Личные заметки и план действий:
              </label>
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Например: до 15 числа согласовать черновик эссе с ментором, перевести справку со школы на английский..."
                rows={3}
                className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Calendar Integration Links */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2">
              <a
                href={makeGoogleCalendarUrl(
                  selectedDetails.opportunity.title,
                  selectedDetails.opportunity.deadlineDate,
                  selectedDetails.opportunity.organizer,
                  selectedDetails.opportunity.link
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium hover:text-zinc-950 dark:hover:text-white transition-colors"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-blue-500" />
                <span>В Google Календарь</span>
              </a>

              <a
                href={`/api/calendar/export?id=${selectedDetails.opportunityId}`}
                download="deadline.ics"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium hover:text-zinc-950 dark:hover:text-white transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <span>Экспорт (.ics)</span>
              </a>

              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={isPending}
                className="ml-auto px-4 py-1.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
