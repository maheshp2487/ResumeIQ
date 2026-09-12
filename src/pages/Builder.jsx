import { useState, useRef } from 'react'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card, { CardTitle } from '../components/ui/Card'
import { useToast } from '../context/ToastContext'
import DateRangePicker from '../components/ui/DateRangePicker'
import { isSpamInput } from '../utils/validation'

const TEMPLATES = ['Professional', 'Modern', 'Executive', 'Minimalist', 'Creative', 'Tech']

export default function Builder() {
  const { push: toast } = useToast()
  const printRef = useRef()

  const [activeTab, setActiveTab] = useState('profile')
  const [template, setTemplate] = useState('Professional')
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false)
  const [expandedExpId, setExpandedExpId] = useState(null)
  const [expandedEduId, setExpandedEduId] = useState(null)
  const [newSkill, setNewSkill] = useState('')

  // Resume State
  const [data, setData] = useState({
    profile: { name: 'John Doe', title: 'Software Engineer', email: 'john@example.com', phone: '(555) 123-4567', location: 'San Francisco, CA', summary: 'Experienced engineer passionate about building scalable web applications.' },
    experience: [
      { id: '1', company: 'Tech Corp', role: 'Senior Developer', date: '2020 - Present', desc: 'Led the frontend team in rebuilding the core application using React. Improved performance by 40%.' }
    ],
    education: [
      { id: '1', school: 'University of Technology', degree: 'B.S. Computer Science', date: '2016 - 2020' }
    ],
    skills: 'JavaScript, React, Node.js, Python, AWS, Docker'
  })

  const updateProfile = (field, value) => setData(p => ({ ...p, profile: { ...p.profile, [field]: value } }))

  const handlePrint = () => {
    // Clone the resume into a dedicated print container appended to body
    // This bypasses any overflow:hidden or flex layouts from AppLayout that break printing
    const printContainer = document.createElement('div')
    printContainer.id = 'print-container'
    printContainer.innerHTML = printRef.current.innerHTML
    document.body.appendChild(printContainer)
    document.body.classList.add('is-printing')

    setTimeout(() => {
      window.print()
      document.body.removeChild(printContainer)
      document.body.classList.remove('is-printing')
    }, 500)
  }

  const handleBlurSpamCheck = (e, fieldName) => {
    if (isSpamInput(e.target.value)) {
      toast({ message: `Please enter a valid ${fieldName}.`, variant: 'warning' })
    }
  }

  // Validate an experience entry before collapsing
  const validateAndCollapseExp = (exp) => {
    const isExpanded = expandedExpId === exp.id
    if (!isExpanded) { setExpandedExpId(exp.id); return }
    if (!exp.company.trim()) {
      toast({ message: 'Company name is required.', variant: 'error' }); return
    }
    if (isSpamInput(exp.company)) {
      toast({ message: 'Please enter a valid company name.', variant: 'error' }); return
    }
    if (!exp.role.trim()) {
      toast({ message: 'Job role / position is required.', variant: 'error' }); return
    }
    if (isSpamInput(exp.role)) {
      toast({ message: 'Please enter a valid job role.', variant: 'error' }); return
    }
    if (!exp.date || exp.date.includes('...')) {
      toast({ message: 'Please select a date range for this experience.', variant: 'error' }); return
    }
    setExpandedExpId(null)
  }

  // Validate an education entry before collapsing
  const validateAndCollapseEdu = (edu) => {
    const isExpanded = expandedEduId === edu.id
    if (!isExpanded) { setExpandedEduId(edu.id); return }
    if (!edu.school.trim()) {
      toast({ message: 'School / University name is required.', variant: 'error' }); return
    }
    if (isSpamInput(edu.school)) {
      toast({ message: 'Please enter a valid institution name.', variant: 'error' }); return
    }
    if (!edu.degree.trim()) {
      toast({ message: 'Degree / qualification is required.', variant: 'error' }); return
    }
    if (isSpamInput(edu.degree)) {
      toast({ message: 'Please enter a valid degree.', variant: 'error' }); return
    }
    if (!edu.date || edu.date.includes('...')) {
      toast({ message: 'Please select a date range for this education.', variant: 'error' }); return
    }
    setExpandedEduId(null)
  }

  // Add new experience only if existing open one is valid
  const handleAddExp = () => {
    const openExp = data.experience.find(e => e.id === expandedExpId)
    if (openExp) {
      if (!openExp.company.trim() || !openExp.role.trim()) {
        toast({ message: 'Please complete the current experience entry before adding a new one.', variant: 'error' })
        return
      }
      if (isSpamInput(openExp.company) || isSpamInput(openExp.role)) {
        toast({ message: 'Please enter valid details for the current experience entry.', variant: 'error' })
        return
      }
    }
    const newId = Date.now().toString()
    setData(p => ({ ...p, experience: [...p.experience, { id: newId, company: '', role: '', date: '', desc: '' }] }))
    setExpandedExpId(newId)
  }

  // Add new education only if existing open one is valid
  const handleAddEdu = () => {
    const openEdu = data.education.find(e => e.id === expandedEduId)
    if (openEdu) {
      if (!openEdu.school.trim() || !openEdu.degree.trim()) {
        toast({ message: 'Please complete the current education entry before adding a new one.', variant: 'error' })
        return
      }
      if (isSpamInput(openEdu.school) || isSpamInput(openEdu.degree)) {
        toast({ message: 'Please enter valid details for the current education entry.', variant: 'error' })
        return
      }
    }
    const newId = Date.now().toString()
    setData(p => ({ ...p, education: [...p.education, { id: newId, school: '', degree: '', date: '' }] }))
    setExpandedEduId(newId)
  }

  // --- Renderers for Form ---
  const renderProfileForm = () => (
    <div className="space-y-5 animate-fade-in">
      <Input label="Full Name" placeholder="e.g. Jane Smith" value={data.profile.name} maxLength={80} onBlur={e => handleBlurSpamCheck(e, 'Name')} onChange={e => updateProfile('name', e.target.value)} />
      <Input label="Professional Title" placeholder="e.g. Senior Product Designer" value={data.profile.title} maxLength={80} onBlur={e => handleBlurSpamCheck(e, 'Title')} onChange={e => updateProfile('title', e.target.value)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input label="Email" type="email" placeholder="jane@example.com" value={data.profile.email} maxLength={80} onChange={e => updateProfile('email', e.target.value)} />
        <Input label="Phone" placeholder="(555) 123-4567" value={data.profile.phone} maxLength={30} onChange={e => updateProfile('phone', e.target.value)} />
      </div>
      <Input label="Location" placeholder="e.g. New York, NY" value={data.profile.location} maxLength={80} onChange={e => updateProfile('location', e.target.value)} />
      <div>
        <label className="block text-sm font-semibold text-txt mb-2">Professional Summary</label>
        <textarea
          placeholder="A brief summary of your core competencies, achievements, and career goals..."
          value={data.profile.summary}
          maxLength={600}
          onChange={e => updateProfile('summary', e.target.value)}
          className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm text-txt focus:border-brand focus:ring-4 focus:ring-brand-surface outline-none transition-all resize-y min-h-[120px]"
        />
      </div>
    </div>
  )

  const renderExperienceForm = () => (
    <div className="space-y-4 animate-fade-in">
      {data.experience.map((exp, index) => {
        const isExpanded = expandedExpId === exp.id
        return (
          <div key={exp.id} className="border border-border rounded-xl bg-bg shadow-sm transition-all duration-200 hover:border-border-hover group">
            {/* Accordion Header */}
            <div 
              className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${isExpanded ? 'bg-bg-secondary' : 'bg-bg hover:bg-bg-secondary/50'}`}
              onClick={() => validateAndCollapseExp(exp)}
            >
              <div className="flex flex-col">
                <span className="font-bold text-txt">{exp.role || 'New Role'}</span>
                <span className="text-sm text-txt-muted">{exp.company || 'Company Name'}</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => { 
                    e.stopPropagation()
                    setData(p => ({ ...p, experience: p.experience.filter(e => e.id !== exp.id) }))
                  }}
                  className="p-2 text-txt-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
                <span className="text-txt-muted">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                </span>
              </div>
            </div>

            {/* Accordion Body */}
            {isExpanded && (
              <div className="p-5 border-t border-border space-y-5 bg-bg animate-in slide-in-from-top-2">
                <Input label="Company" placeholder="e.g. Acme Corp" value={exp.company} maxLength={80} onBlur={e => handleBlurSpamCheck(e, 'Company Name')} onChange={e => {
                  const newExp = [...data.experience]
                  newExp[index].company = e.target.value
                  setData({ ...data, experience: newExp })
                }} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input label="Role" placeholder="e.g. Senior Engineer" value={exp.role} maxLength={80} onBlur={e => handleBlurSpamCheck(e, 'Role')} onChange={e => {
                    const newExp = [...data.experience]
                    newExp[index].role = e.target.value
                    setData({ ...data, experience: newExp })
                  }} />
                  <DateRangePicker value={exp.date} onChange={val => {
                    const newExp = [...data.experience]
                    newExp[index].date = val
                    setData({ ...data, experience: newExp })
                  }} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-txt mb-2">Description</label>
                  <textarea
                    placeholder="• Led a team of 5 engineers to build a new microservice...&#10;• Increased revenue by 25% through optimization..."
                    value={exp.desc}
                    maxLength={1500}
                    onChange={e => {
                      const newExp = [...data.experience]
                      newExp[index].desc = e.target.value
                      setData({ ...data, experience: newExp })
                    }}
                    className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-sm text-txt focus:border-brand focus:ring-4 focus:ring-brand-surface outline-none transition-all resize-y min-h-[120px]"
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}
      {data.experience.length < 8 && (
        <button 
          onClick={handleAddExp}
          className="w-full py-4 border-2 border-dashed border-border hover:border-brand hover:bg-brand/5 text-txt-muted hover:text-brand font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Experience
        </button>
      )}
    </div>
  )

  const renderEducationForm = () => (
    <div className="space-y-4 animate-fade-in">
      {data.education.map((edu, index) => {
        const isExpanded = expandedEduId === edu.id
        return (
          <div key={edu.id} className="border border-border rounded-xl bg-bg shadow-sm transition-all duration-200 hover:border-border-hover group">
            {/* Accordion Header */}
            <div 
              className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${isExpanded ? 'bg-bg-secondary' : 'bg-bg hover:bg-bg-secondary/50'}`}
              onClick={() => validateAndCollapseEdu(edu)}
            >
              <div className="flex flex-col">
                <span className="font-bold text-txt">{edu.school || 'New Institution'}</span>
                <span className="text-sm text-txt-muted">{edu.degree || 'Degree'}</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={(e) => { 
                    e.stopPropagation()
                    setData(p => ({ ...p, education: p.education.filter(e => e.id !== edu.id) }))
                  }}
                  className="p-2 text-txt-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
                <span className="text-txt-muted">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                </span>
              </div>
            </div>

            {/* Accordion Body */}
            {isExpanded && (
              <div className="p-5 border-t border-border space-y-5 bg-bg animate-in slide-in-from-top-2">
                <Input label="School / University" placeholder="e.g. Stanford University" value={edu.school} maxLength={100} onBlur={e => handleBlurSpamCheck(e, 'University')} onChange={e => {
                  const newEdu = [...data.education]
                  newEdu[index].school = e.target.value
                  setData({ ...data, education: newEdu })
                }} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input label="Degree" placeholder="e.g. B.S. Computer Science" value={edu.degree} maxLength={100} onBlur={e => handleBlurSpamCheck(e, 'Degree')} onChange={e => {
                    const newEdu = [...data.education]
                    newEdu[index].degree = e.target.value
                    setData({ ...data, education: newEdu })
                  }} />
                  <DateRangePicker value={edu.date} onChange={val => {
                    const newEdu = [...data.education]
                    newEdu[index].date = val
                    setData({ ...data, education: newEdu })
                  }} />
                </div>
              </div>
            )}
          </div>
        )
      })}
      {data.education.length < 5 && (
        <button 
          onClick={handleAddEdu}
          className="w-full py-4 border-2 border-dashed border-border hover:border-brand hover:bg-brand/5 text-txt-muted hover:text-brand font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Education
        </button>
      )}
    </div>
  )

  const handleAddSkill = (e) => {
    e.preventDefault()
    const trimmed = newSkill.trim()
    if (!trimmed) return
    
    if (trimmed.length > 30) {
      toast({ message: 'Skill name is too long.', variant: 'error' })
      return
    }
    
    if (isSpamInput(trimmed)) {
      toast({ message: 'Please enter a valid skill.', variant: 'error' })
      return
    }

    const currentSkills = data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : []
    
    if (currentSkills.length >= 20) {
      toast({ message: 'Maximum of 20 skills allowed.', variant: 'warning' })
      return
    }

    if (!currentSkills.includes(trimmed)) {
      const updatedSkills = [...currentSkills, trimmed].join(', ')
      setData(p => ({ ...p, skills: updatedSkills }))
    }
    setNewSkill('')
  }

  const handleRemoveSkill = (skillToRemove) => {
    const currentSkills = data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : []
    const updatedSkills = currentSkills.filter(s => s !== skillToRemove).join(', ')
    setData(p => ({ ...p, skills: updatedSkills }))
  }

  const renderSkillsForm = () => {
    const skillsList = data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : []
    
    return (
      <div className="animate-fade-in">
        <label className="block text-sm font-semibold text-txt mb-3">Technical Skills & Core Competencies</label>
        
        {skillsList.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {skillsList.map((skill, idx) => (
              <div key={idx} className="flex items-center gap-1.5 bg-brand-surface text-brand px-3 py-1.5 rounded-lg text-sm font-bold border border-brand/20">
                {skill}
                <button 
                  type="button" 
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-brand hover:text-brand-hover ml-1 p-0.5 rounded-md hover:bg-brand/10 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddSkill} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. JavaScript, React, Project Management..."
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            className="flex-1 px-4 py-3 bg-bg border border-border rounded-xl text-sm text-txt focus:border-brand focus:ring-4 focus:ring-brand-surface outline-none transition-all"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-brand hover:bg-brand-hover text-white rounded-xl text-sm font-bold shadow-md shadow-brand/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add
          </button>
        </form>
        <p className="text-xs text-txt-muted mt-3">Type a skill and press Enter or click Add.</p>
      </div>
    )
  }

  // --- Renderers for Templates ---
  const ProfessionalTemplate = () => (
    <div className="p-8 bg-white text-black min-h-[800px] shadow-sm rounded-lg font-sans">
      <div className="text-center border-b-2 border-gray-300 pb-4 mb-4">
        <h1 className="text-3xl font-bold uppercase tracking-widest text-gray-900">{data.profile.name || 'Your Name'}</h1>
        <p className="text-lg text-gray-600 mt-1">{data.profile.title}</p>
        <div className="text-sm text-gray-500 mt-2 flex justify-center gap-4 flex-wrap">
          <span>{data.profile.email}</span> • <span>{data.profile.phone}</span> • <span>{data.profile.location}</span>
        </div>
      </div>
      
      {data.profile.summary && (
        <div className="mb-6">
          <p className="text-sm leading-relaxed text-gray-800">{data.profile.summary}</p>
        </div>
      )}

      {data.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase text-gray-900 border-b border-gray-300 mb-3">Experience</h2>
          <div className="space-y-4">
            {data.experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-gray-900">{exp.company}</h3>
                  <span className="text-sm text-gray-600 font-medium">{exp.date}</span>
                </div>
                <p className="text-sm italic text-gray-700 mb-2">{exp.role}</p>
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{exp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase text-gray-900 border-b border-gray-300 mb-3">Education</h2>
          <div className="space-y-3">
            {data.education.map(edu => (
              <div key={edu.id} className="flex justify-between items-baseline">
                <div>
                  <h3 className="font-bold text-gray-900">{edu.school}</h3>
                  <p className="text-sm text-gray-700">{edu.degree}</p>
                </div>
                <span className="text-sm text-gray-600 font-medium">{edu.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.skills && (
        <div>
          <h2 className="text-lg font-bold uppercase text-gray-900 border-b border-gray-300 mb-3">Skills</h2>
          <p className="text-sm text-gray-800 leading-relaxed">{data.skills}</p>
        </div>
      )}
    </div>
  )

  const ModernTemplate = () => (
    <div className="bg-white text-gray-900 min-h-[800px] shadow-sm rounded-lg overflow-hidden font-sans">
      {/* Header Block */}
      <div className="bg-slate-800 px-10 py-12 text-white">
        <h1 className="text-4xl font-black tracking-tight mb-2">{data.profile.name || 'Your Name'}</h1>
        <p className="text-xl font-medium text-slate-300 mb-6">{data.profile.title}</p>
        
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400 font-medium">
          {data.profile.email && <div className="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>{data.profile.email}</div>}
          {data.profile.phone && <div className="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>{data.profile.phone}</div>}
          {data.profile.location && <div className="flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>{data.profile.location}</div>}
        </div>
      </div>
      
      <div className="p-10 space-y-8">
        {data.profile.summary && (
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-4">Profile</h2>
            <p className="text-gray-600 leading-relaxed text-sm">{data.profile.summary}</p>
          </div>
        )}

        {data.experience.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-4">Experience</h2>
            <div className="space-y-6">
              {data.experience.map(exp => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-slate-900">{exp.role}</h3>
                    <span className="text-xs font-bold text-slate-500">{exp.date}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-2">{exp.company}</p>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{exp.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-8">
          {data.education.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-4">Education</h2>
              <div className="space-y-4">
                {data.education.map(edu => (
                  <div key={edu.id}>
                    <h3 className="font-bold text-slate-900 text-sm">{edu.degree}</h3>
                    <p className="text-sm text-slate-700">{edu.school}</p>
                    <p className="text-xs text-slate-500 mt-1">{edu.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.skills && (
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b-2 border-slate-100 pb-2 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.split(',').map((s, i) => s.trim() && (
                  <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">{s.trim()}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const ExecutiveTemplate = () => (
    <div className="p-8 bg-[#fafafa] text-[#111] min-h-[800px] shadow-sm rounded-lg font-serif border-t-8 border-[#111]">
      <div className="mb-8">
        <h1 className="text-4xl font-normal text-[#111] tracking-tight">{data.profile.name || 'Your Name'}</h1>
        <p className="text-md text-[#444] mt-1 font-sans">{data.profile.title}</p>
        <div className="text-sm text-[#666] mt-3 font-sans space-x-3">
          <span>{data.profile.email}</span> | <span>{data.profile.phone}</span> | <span>{data.profile.location}</span>
        </div>
      </div>
      
      {data.profile.summary && (
        <div className="mb-8">
          <p className="text-sm leading-relaxed text-[#333] font-sans">{data.profile.summary}</p>
        </div>
      )}

      {data.experience.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#111] border-b border-[#ddd] pb-2 mb-4 font-sans">Professional Experience</h2>
          <div className="space-y-6">
            {data.experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-[#111] text-lg">{exp.company}</h3>
                  <span className="text-sm text-[#555] font-sans">{exp.date}</span>
                </div>
                <p className="text-sm font-semibold text-[#333] mb-2 font-sans">{exp.role}</p>
                <p className="text-sm text-[#444] leading-relaxed whitespace-pre-line font-sans">{exp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-8">
        {data.education.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#111] border-b border-[#ddd] pb-2 mb-4 font-sans">Education</h2>
            <div className="space-y-4">
              {data.education.map(edu => (
                <div key={edu.id}>
                  <h3 className="font-bold text-[#111]">{edu.school}</h3>
                  <p className="text-sm text-[#333] font-sans">{edu.degree}</p>
                  <p className="text-xs text-[#666] font-sans">{edu.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.skills && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#111] border-b border-[#ddd] pb-2 mb-4 font-sans">Core Competencies</h2>
            <ul className="list-disc list-inside text-sm text-[#444] font-sans leading-relaxed">
              {data.skills.split(',').map((s, i) => s.trim() && <li key={i}>{s.trim()}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  )

  const MinimalistTemplate = () => (
    <div className="p-10 bg-white text-gray-900 min-h-[800px] shadow-sm rounded-lg font-sans tracking-wide">
      <div className="mb-12">
        <h1 className="text-3xl font-light text-gray-900 mb-2">{data.profile.name || 'Your Name'}</h1>
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500 uppercase tracking-widest">
          <span>{data.profile.title}</span>
          {data.profile.title && <span>•</span>}
          <span>{data.profile.location}</span>
          {data.profile.location && <span>•</span>}
          <span>{data.profile.phone}</span>
          {data.profile.phone && <span>•</span>}
          <span>{data.profile.email}</span>
        </div>
      </div>
      
      {data.profile.summary && (
        <div className="mb-10">
          <p className="text-sm leading-relaxed text-gray-600 font-light">{data.profile.summary}</p>
        </div>
      )}

      {data.experience.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-6">Experience</h2>
          <div className="space-y-8">
            {data.experience.map(exp => (
              <div key={exp.id} className="grid grid-cols-12 gap-4">
                <div className="col-span-3 text-xs text-gray-400 font-medium mt-1 uppercase">{exp.date}</div>
                <div className="col-span-9">
                  <h3 className="font-semibold text-gray-900 text-sm">{exp.company}</h3>
                  <p className="text-xs text-gray-500 mb-3">{exp.role}</p>
                  <p className="text-sm text-gray-600 font-light leading-relaxed whitespace-pre-line">{exp.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.education.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-6">Education</h2>
          <div className="space-y-6">
            {data.education.map(edu => (
              <div key={edu.id} className="grid grid-cols-12 gap-4">
                <div className="col-span-3 text-xs text-gray-400 font-medium mt-1 uppercase">{edu.date}</div>
                <div className="col-span-9">
                  <h3 className="font-semibold text-gray-900 text-sm">{edu.school}</h3>
                  <p className="text-xs text-gray-500">{edu.degree}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.skills && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4">Skills</h2>
          <p className="text-sm text-gray-600 font-light leading-relaxed">{data.skills}</p>
        </div>
      )}
    </div>
  )

  const CreativeTemplate = () => (
    <div className="flex bg-white text-gray-900 min-h-[800px] shadow-sm rounded-lg overflow-hidden font-sans">
      <div className="w-1/3 bg-indigo-900 text-indigo-50 p-8">
        <div className="w-24 h-24 rounded-full bg-indigo-400/30 flex items-center justify-center text-3xl font-black text-white mb-6">
          {(data.profile.name || 'YN').substring(0,2).toUpperCase()}
        </div>
        <h1 className="text-2xl font-bold text-white leading-tight mb-2">{data.profile.name || 'Your Name'}</h1>
        <p className="text-sm font-medium text-indigo-300 mb-8">{data.profile.title}</p>
        
        <div className="space-y-4 mb-10 text-sm text-indigo-200">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Email</span>
            <span className="break-all">{data.profile.email}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Phone</span>
            <span>{data.profile.phone}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Location</span>
            <span>{data.profile.location}</span>
          </div>
        </div>

        {data.skills && (
          <div>
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-4">Expertise</h2>
            <div className="flex flex-col gap-2">
              {data.skills.split(',').map((s, i) => s.trim() && (
                <div key={i} className="text-sm font-medium bg-indigo-800/50 px-3 py-1.5 rounded-lg border border-indigo-700/50">{s.trim()}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-2/3 p-10 bg-gray-50">
        {data.profile.summary && (
          <div className="mb-10 relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-indigo-500 rounded-full"></div>
            <p className="text-sm leading-relaxed text-gray-600 font-medium italic">{data.profile.summary}</p>
          </div>
        )}

        {data.experience.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-indigo-500">•</span> Experience
            </h2>
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-1.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              {data.experience.map(exp => (
                <div key={exp.id} className="relative pl-6 border-l-2 border-indigo-200">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-indigo-500"></div>
                  <h3 className="font-bold text-gray-900">{exp.role}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-sm font-semibold text-indigo-600">{exp.company}</p>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs font-medium text-gray-500">{exp.date}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{exp.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.education.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-indigo-500">•</span> Education
            </h2>
            <div className="grid gap-6">
              {data.education.map(edu => (
                <div key={edu.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 text-sm">{edu.degree}</h3>
                  <p className="text-sm text-indigo-600 font-medium mb-1">{edu.school}</p>
                  <p className="text-xs text-gray-400 font-medium">{edu.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const TechTemplate = () => (
    <div className="p-8 bg-white text-gray-900 min-h-[800px] shadow-sm rounded-lg font-sans text-[13px] leading-relaxed">
      <div className="border-b-2 border-gray-900 pb-4 mb-5 text-center">
        <h1 className="text-3xl font-bold uppercase tracking-tight text-gray-900 mb-1">{data.profile.name || 'Your Name'}</h1>
        <div className="flex flex-wrap items-center justify-center gap-3 text-gray-600 font-medium">
          <span>{data.profile.email}</span>
          {data.profile.email && <span>|</span>}
          <span>{data.profile.phone}</span>
          {data.profile.phone && <span>|</span>}
          <span>{data.profile.location}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-1 space-y-6">
          {data.skills && (
            <div>
              <h2 className="text-sm font-bold uppercase text-gray-900 border-b border-gray-300 pb-1 mb-3 tracking-wider">Technical Skills</h2>
              <div className="flex flex-col gap-1.5 text-gray-700">
                {data.skills.split(',').map((s, i) => s.trim() && (
                  <span key={i}>• {s.trim()}</span>
                ))}
              </div>
            </div>
          )}

          {data.education.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase text-gray-900 border-b border-gray-300 pb-1 mb-3 tracking-wider">Education</h2>
              <div className="space-y-4">
                {data.education.map(edu => (
                  <div key={edu.id}>
                    <h3 className="font-bold text-gray-900">{edu.school}</h3>
                    <p className="text-gray-700 font-medium">{edu.degree}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{edu.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="col-span-2 space-y-6">
          {data.profile.summary && (
            <div>
              <h2 className="text-sm font-bold uppercase text-gray-900 border-b border-gray-300 pb-1 mb-3 tracking-wider">Summary</h2>
              <p className="text-gray-700 text-justify">{data.profile.summary}</p>
            </div>
          )}

          {data.experience.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase text-gray-900 border-b border-gray-300 pb-1 mb-3 tracking-wider">Experience</h2>
              <div className="space-y-6">
                {data.experience.map(exp => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="font-bold text-gray-900 text-sm">{exp.company}</h3>
                      <span className="text-gray-600 text-xs font-bold bg-gray-100 px-2 py-0.5 rounded">{exp.date}</span>
                    </div>
                    <p className="text-gray-800 font-bold italic mb-2">{exp.role}</p>
                    <div className="text-gray-700 whitespace-pre-line text-justify">
                      {exp.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderActiveTemplate = () => {
    switch (template) {
      case 'Modern': return <ModernTemplate />
      case 'Executive': return <ExecutiveTemplate />
      case 'Minimalist': return <MinimalistTemplate />
      case 'Creative': return <CreativeTemplate />
      case 'Tech': return <TechTemplate />
      default: return <ProfessionalTemplate />
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in relative z-10">

      <div className="print-hide space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <PageHeader
            title="Resume Builder"
            subtitle="Build and export a premium, ATS-friendly resume."
          />
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button onClick={() => setIsMobilePreviewOpen(!isMobilePreviewOpen)} variant="outline" className="lg:hidden w-full sm:w-auto justify-center">
              {isMobilePreviewOpen ? 'Edit Content' : 'View Preview'}
            </Button>
            <Button onClick={handlePrint} className="bg-brand text-white w-full sm:w-auto justify-center">
              Export PDF
            </Button>
          </div>
        </div>

        {/* Template Selector */}
        <div className="flex flex-wrap gap-2 p-1 bg-bg-secondary border border-border rounded-xl w-fit">
          {TEMPLATES.map(t => (
            <button
              key={t}
              onClick={() => setTemplate(t)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${template === t ? 'bg-bg text-txt shadow-sm border border-border' : 'text-txt-muted hover:text-txt'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start gap-8">
          
          {/* Left Column: Form (hidden on mobile if preview is open) */}
          <div className={`w-full lg:w-1/2 flex-shrink-0 ${isMobilePreviewOpen ? 'hidden lg:block' : 'block'}`}>
            <Card className="rounded-2xl border border-border bg-bg shadow-sm h-fit flex flex-col">
              <div className="flex overflow-x-auto border-b border-border mb-6 hide-scrollbar">
                {['profile', 'experience', 'education', 'skills'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 min-w-[100px] py-3 text-sm font-bold uppercase tracking-wider text-center border-b-2 transition-colors ${activeTab === tab ? 'border-brand text-brand bg-brand-surface' : 'border-transparent text-txt-muted hover:bg-bg-secondary'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex-1">
                {activeTab === 'profile' && renderProfileForm()}
                {activeTab === 'experience' && renderExperienceForm()}
                {activeTab === 'education' && renderEducationForm()}
                {activeTab === 'skills' && renderSkillsForm()}
              </div>
            </Card>
          </div>

          {/* Right Column: Live Preview (hidden on mobile if form is open) */}
          <div className={`w-full lg:w-1/2 ${!isMobilePreviewOpen ? 'hidden lg:block' : 'block'}`}>
            <div className="sticky top-24">
              <div className="bg-gray-200/50 dark:bg-gray-800/50 rounded-2xl p-4 overflow-x-auto border border-border">
                {/* The actual preview container that gets printed */}
                <div id="resume-preview" ref={printRef} className="origin-top lg:scale-95 transition-transform bg-white text-black w-full max-w-[850px] mx-auto shadow-2xl">
                  {renderActiveTemplate()}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
