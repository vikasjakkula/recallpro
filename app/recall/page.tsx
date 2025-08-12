"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "../../utils/supabase/client";


// Add types for Subject, Lesson, and LessonPdf
interface Subject {
  id: string;
  name: string;
  icon?: string;
}
interface Lesson {
  id: string;
  subject_id: string;
  name: string;
  position: number;
}
interface LessonPdf {
  id: string;
  lesson_id: string;
  pdf_url: string;
}

// Sidebar component with dropdowns for subjects and lessons
function Sidebar({
  subjects,
  expandedSubjects,
  toggleSubject,
  expandedLesson,
  toggleLesson,
  lessons,
  startEdit,
  handleDelete,
}: {
  subjects: Subject[];
  expandedSubjects: { [key: string]: boolean };
  toggleSubject: (subject: Subject) => void;
  expandedLesson: string | null;
  toggleLesson: (lessonId: string) => void;
  lessons: Lesson[];
  startEdit: (type: 'subject' | 'lesson', item: any) => void;
  handleDelete: (type: 'subject' | 'lesson', id: string, parentId?: string) => void;
}) {
  return (
    <aside className="w-full sm:w-80 bg-white shadow-2xl border-r border-gray-100 px-4 sm:px-6 py-6 sm:py-8 overflow-y-auto flex flex-col min-h-screen">
      {/* Sidebar Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Study Dashboard</h1>
        <p className="text-gray-600 text-sm">Select a subject to begin learning</p>
      </div>

      {/* Subject Dropdowns */}
      <div className="flex flex-col gap-3">
        {subjects.map((subject) => (
          <div key={subject.id} className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50">
            {/* Subject Button */}
            <button
              className={`w-full flex items-center justify-between px-6 py-4 transition-all duration-300 ${
                expandedSubjects[subject.id]
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                  : "bg-white hover:bg-gray-50 text-gray-800 hover:shadow-md"
              }`}
              onClick={() => toggleSubject(subject)}
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold text-lg">{subject.icon} {subject.name}</span>
              </div>
              <svg 
                className={`w-5 h-5 transition-transform duration-300 ${
                  expandedSubjects[subject.id] ? 'rotate-180' : ''
                }`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Lessons Dropdown */}
            <AnimatePresence initial={false}>
              {expandedSubjects[subject.id] && (
                <motion.div
                  className="bg-gray-50"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="px-4 py-2">
                    {lessons
                      .filter((l) => l.subject_id === subject.id)
                      .map((lesson) => (
                        <button
                          key={lesson.id}
                          className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex justify-between items-center mb-1 ${
                            expandedLesson === lesson.id
                              ? "bg-blue-100 text-blue-800 border border-blue-200 font-medium"
                              : "text-gray-700 hover:bg-white hover:text-gray-900 hover:shadow-sm"
                          }`}
                          onClick={() => toggleLesson(lesson.id)}
                        >
                          <span className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              expandedLesson === lesson.id ? 'bg-blue-500' : 'bg-gray-400'
                            }`}></div>
                            {lesson.name}
                          </span>
                          {expandedLesson === lesson.id && (
                            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Study smart, achieve more
        </p>
      </div>
    </aside>
  );
}

// Right panel PDF view with enhanced design
function LessonContent({
  subject,
  lesson,
  pdfs,
  startEdit,
  handleDelete,
}: {
  subject: Subject | null;
  lesson: Lesson | undefined;
  pdfs: LessonPdf[];
  startEdit: (type: 'pdf', item: any) => void;
  handleDelete: (type: 'pdf', id: string, parentId?: string) => void;
}) {
  // Always fit to page: we show a "Fit to Page" button that is always visually "on" and do not provide any toggle.
  // The iframe will always be styled to fit the page.
  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden p-4 sm:p-6 flex flex-col">
      <AnimatePresence mode="wait">
        {subject && lesson && pdfs.length > 0 ? (
          <motion.div
            key={lesson.id}
            className="h-full flex flex-col p-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {subject.name}
                  </h2>
                  <p className="text-gray-600 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Currently viewing: <span className="font-semibold text-blue-600">{lesson.name}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium">
                    Download
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                    Print
                  </button>
                  {/* Fit to Page button always ON, not toggleable */}
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium cursor-default shadow"
                    disabled
                    aria-pressed="true"
                    title="Fit to Page is always enabled"
                  >
                    Fit to Page
                  </button>
                </div>
              </div>
            </div>

            {/* PDF Viewer Container */}
            <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <iframe
                src={pdfs[0].pdf_url}
                title="Lesson PDF"
                className="w-full h-full"
                style={{
                  minHeight: 'calc(100vh - 220px)',
                  border: 'none',
                  background: '#ffffff',
                  width: '100%',
                  height: '100%',
                }}
              />
            </div>
          
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            className="h-full flex flex-col items-center justify-center p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Ready to Learn?
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Select a subject from the sidebar and choose a lesson to start your learning journey.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>Waiting for selection...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Main Study App
export default function StudyApp() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [pdfs, setPdfs] = useState<LessonPdf[]>([]);
  const [expandedSubjects, setExpandedSubjects] = useState<{ [key: string]: boolean }>({});
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<'subject' | 'lesson' | 'pdf'>("subject");
  const [form, setForm] = useState<{
    subjectName: string;
    subjectIcon: string;
    lessonName: string;
    lessonPosition: number;
    lessonSubjectId: string;
    pdfLessonId: string;
    pdfFile: File | null;
  }>({
    subjectName: "",
    subjectIcon: "",
    lessonName: "",
    lessonPosition: 1,
    lessonSubjectId: "",
    pdfLessonId: "",
    pdfFile: null,
  });
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [editMode, setEditMode] = useState<null | { type: 'subject' | 'lesson' | 'pdf', id: string }>(null);
  const [editForm, setEditForm] = useState<any>({});
  const supabase = createClient();

  // Fetch subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  async function fetchSubjects() {
    const { data, error } = await supabase.from("subjects").select();
    if (!error && data) setSubjects(data as Subject[]);
  }

  async function fetchLessons(subjectId: string) {
    const { data, error } = await supabase
      .from("lessons")
      .select()
      .eq("subject_id", subjectId)
      .order("position");
    if (!error && data) setLessons(data as Lesson[]);
  }

  async function fetchPdfs(lessonId: string) {
    const { data, error } = await supabase
      .from("lesson_pdfs")
      .select()
      .eq("lesson_id", lessonId);
    if (!error && data) setPdfs(data as LessonPdf[]);
  }

  // Toggle subject dropdown
  const toggleSubject = (subject: Subject) => {
    setExpandedSubjects((prev) => {
      const newState = Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {} as { [key: string]: boolean });
      return { ...newState, [subject.id]: !prev[subject.id] };
    });
    setActiveSubject(subject);
    setExpandedLesson(null);
    setLessons([]);
    setPdfs([]);
    fetchLessons(subject.id);
  };

  // Toggle lesson dropdown
  const toggleLesson = (lessonId: string) => {
    setExpandedLesson((prev) => (prev === lessonId ? null : lessonId));
    setPdfs([]);
    fetchPdfs(lessonId);
  };

  // Modal form handlers
  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, files } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  }

  async function handleAddSubject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await supabase.from("subjects").insert({ name: form.subjectName, icon: form.subjectIcon });
    setForm((f) => ({ ...f, subjectName: "", subjectIcon: "" }));
    fetchSubjects();
    setSuccessMessage("Subject added!");
    setTimeout(() => setSuccessMessage(""), 2000);
  }

  async function handleAddLesson(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await supabase.from("lessons").insert({
      subject_id: form.lessonSubjectId,
      name: form.lessonName,
      position: form.lessonPosition,
    });
    setForm((f) => ({ ...f, lessonName: "", lessonPosition: 1 }));
    fetchLessons(form.lessonSubjectId);
    setSuccessMessage("Lesson added!");
    setTimeout(() => setSuccessMessage(""), 2000);
  }

  async function handleAddPdf(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.pdfFile) return;
    // Upload to Supabase Storage
    const fileExt = form.pdfFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("lesson-pdfs")
      .upload(fileName, form.pdfFile);
    if (uploadError) return;
    const { data: urlData } = supabase.storage.from("lesson-pdfs").getPublicUrl(fileName);
    // Save in DB
    await supabase.from("lesson_pdfs").insert({
      lesson_id: form.pdfLessonId,
      pdf_url: urlData.publicUrl,
    });
    setForm((f) => ({ ...f, pdfFile: null }));
    fetchPdfs(form.pdfLessonId);
    setSuccessMessage("PDF uploaded!");
    setTimeout(() => setSuccessMessage(""), 2000);
  }

  function startEdit(type: 'subject' | 'lesson' | 'pdf', item: any) {
    setEditMode({ type, id: item.id });
    setEditForm({ ...item });
  }

  function handleEditFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, files } = e.target as HTMLInputElement;
    setEditForm((prev: any) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editMode) return;
    if (editMode.type === 'subject') {
      await supabase.from("subjects").update({
        name: editForm.name,
        icon: editForm.icon
      }).eq("id", editMode.id);
      fetchSubjects();
      setSuccessMessage("Subject updated!");
    } else if (editMode.type === 'lesson') {
      await supabase.from("lessons").update({
        name: editForm.name,
        position: editForm.position,
        subject_id: editForm.subject_id
      }).eq("id", editMode.id);
      fetchLessons(editForm.subject_id);
      setSuccessMessage("Lesson updated!");
    } else if (editMode.type === 'pdf') {
      let pdf_url = editForm.pdf_url;
      if (editForm.pdfFile) {
        // Upload new file
        const fileExt = editForm.pdfFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("lesson-pdfs")
          .upload(fileName, editForm.pdfFile);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("lesson-pdfs").getPublicUrl(fileName);
          pdf_url = urlData.publicUrl;
        }
      }
      await supabase.from("lesson_pdfs").update({
        pdf_url
      }).eq("id", editMode.id);
      fetchPdfs(editForm.lesson_id);
      setSuccessMessage("PDF updated!");
    }
    setEditMode(null);
    setTimeout(() => setSuccessMessage(""), 2000);
  }

  async function handleDelete(type: 'subject' | 'lesson' | 'pdf', id: string, parentId?: string) {
    if (type === 'subject') {
      await supabase.from("subjects").delete().eq("id", id);
      fetchSubjects();
      setSuccessMessage("Subject deleted!");
    } else if (type === 'lesson') {
      await supabase.from("lessons").delete().eq("id", id);
      fetchLessons(parentId!);
      setSuccessMessage("Lesson deleted!");
    } else if (type === 'pdf') {
      await supabase.from("lesson_pdfs").delete().eq("id", id);
      fetchPdfs(parentId!);
      setSuccessMessage("PDF deleted!");
    }
    setTimeout(() => setSuccessMessage(""), 2000);
  }

  return (
    <div className="flex flex-col sm:flex-row min-h-screen w-full font-inter bg-gray-50 overflow-hidden">
      {/* Sidebar with subjects and lessons */}
      <Sidebar
        subjects={subjects}
        expandedSubjects={expandedSubjects}
        toggleSubject={toggleSubject}
        expandedLesson={expandedLesson}
        toggleLesson={toggleLesson}
        lessons={lessons}
        startEdit={startEdit}
        handleDelete={handleDelete}
      />
      
      {/* Main content area */}
      <LessonContent
        subject={activeSubject}
        lesson={lessons.find((l) => l.id === expandedLesson)}
        pdfs={pdfs}
        startEdit={startEdit}
        handleDelete={handleDelete}
      />
    </div>
  );
}