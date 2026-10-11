import { useState } from 'react';
import type { FormEvent } from 'react';
import './App.css';


type Entry = {
  id: string;
  title: string;
  organization: string;
  year: string;
  description: string;
  technologies: string;
  url: string;
};
function newEntry(): Entry {
  return {
    id: crypto.randomUUID(),
    title: '',
    organization: '',
    year: '',
    description: '',
    technologies: '',
    url: '',
  };
}
const initialContact = {
  fullName: '',
  email: '',
  phoneNumber: '',
  linkedin: '',
  github: '',
};
const initialSkills = {
  languages: '',
  backend: '',
  databases: '',
  tools: '',
  testing: '',
};
const splitList = (value: string) =>
  value.split(',').map(item => item.trim()).filter(Boolean);
type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  placeholder?: string;
};
function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  multiline = false,
  placeholder,
}: FieldProps) {
  return (
    <label className="field">
      <span>{label}{required && ' *'}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={event => onChange(event.target.value)}
          required={required}
          placeholder={placeholder}
          rows={4}
          maxLength={4000}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={event => onChange(event.target.value)}
          required={required}
          placeholder={placeholder}
          maxLength={500}
        />
      )}
    </label>
  );
}
type EntriesProps = {
  kind: 'experience' | 'project' | 'education';
  entries: Entry[];
  onChange: (entries: Entry[]) => void;
};
function Entries({ kind, entries, onChange }: EntriesProps) {
  const heading = kind === 'experience' ? 'Experience' : kind === 'education' ? 'Education' : 'Projects';
  function update(id: string, key: keyof Entry, value: string) {
    onChange(entries.map(entry =>
      entry.id === id ? { ...entry, [key]: value } : entry,
    ));
  }
  return (
    <section className="card">
      <div className="section-heading">
        <h2>{heading}</h2>
        <button
          type="button"
          className="secondary"
          disabled={entries.length >= 8}
          onClick={() => onChange([...entries, newEntry()])}
        >
          + Add {kind}
        </button>
      </div>
      {entries.length === 0 && (
        <p className="muted">Add an entry if this section applies to you.</p>
      )}
      {entries.map((entry, index) => (
        <div className="entry" key={entry.id}>
          <div className="section-heading">
            <h3>{kind === 'education' ? 'Qualification' : kind === 'experience' ? 'Experience' : 'Project'} {index + 1}</h3>
            <button
              type="button"
              className="remove"
              aria-label={`Remove ${kind} ${index + 1}`}
              onClick={() => onChange(entries.filter(item => item.id !== entry.id))}
            >
              Remove
            </button>
          </div>
          <div className="grid">
            <Field
              label={kind === 'education' ? 'Degree or qualification' : kind === 'experience' ? 'Role' : 'Project name'}
              value={entry.title}
              onChange={value => update(entry.id, 'title', value)}
              required
            />
            <Field
              label="Year or date range"
              value={entry.year}
              onChange={value => update(entry.id, 'year', value)}
              placeholder="2024–2025"
            />
            {kind !== 'project' ? (
              <Field
                label={kind === 'education' ? 'School or university' : 'Organization'}
                value={entry.organization}
                onChange={value => update(entry.id, 'organization', value)}
                required
              />
            ) : (
              <>
                <Field
                  label="Technologies, separated by commas"
                  value={entry.technologies}
                  onChange={value => update(entry.id, 'technologies', value)}
                  placeholder="TypeScript, NestJS, PostgreSQL"
                />
                <Field
                  label="Project URL"
                  type="url"
                  value={entry.url}
                  onChange={value => update(entry.id, 'url', value)}
                  placeholder="https://github.com/..."
                />
              </>
            )}
          </div>
          <Field
            label={kind === 'education' ? 'Details (optional)' : 'What did you do?'}
            value={entry.description}
            onChange={value => update(entry.id, 'description', value)}
            multiline
            required={kind !== 'education'}
            placeholder={kind === 'education' ? 'Field of study, relevant coursework, or actual honors.' : 'Describe your contribution and actual results.'}
          />
        </div>
      ))}
    </section>
  );
}



export default function App() {
  const[pdfUrl, setPdfUrl] = useState<string | null>(null); 
  const [contact, setContact] = useState(initialContact);
  const [skills, setSkills] = useState(initialSkills);
  const [summary, setSummary] = useState('');
  const [experience, setExperience] = useState<Entry[]>([]);
  const [projects, setProjects] = useState<Entry[]>([]);
  const [education, setEducation] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  function resetForm() {
    setContact(initialContact);
    setSkills(initialSkills);
    setSummary(''); 
    setExperience([]);
    setProjects([]);
    setEducation([]);
    setError('');
    setMessage('');
    if (pdfUrl) {
    URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl('');
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError('');
    setMessage('');
    if (!contact.fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!contact.email.trim() && !contact.phoneNumber.trim()) {
      setError('Please provide an email address or phone number.');
      return;
    }
    const hasSkills = Object.values(skills).some(value => splitList(value).length > 0);
    const sectionCount =
      Number(hasSkills) + Number(experience.length > 0) + Number(projects.length > 0) + Number(education.length > 0);
    if (sectionCount < 2) {
      setError('Complete at least two sections: skills, experience, projects, or education.');
      return;
    }
    const incomplete = experience.some(e => !e.title.trim() || !e.organization.trim() || !e.description.trim())
      || projects.some(e => !e.title.trim() || !e.description.trim())
      || education.some(e => !e.title.trim() || !e.organization.trim());
    if (incomplete) {
      setError('Complete the required fields in each entry, or remove the empty entry.');
      return;
    }
    const cvData = {
      education: education.map(entry => ({
        degree: entry.title.trim(),
        institution: entry.organization.trim(),
        year: entry.year.trim(),
        description: entry.description.trim(),
      })),
      contactDetails: Object.fromEntries(
        Object.entries(contact).map(([key, value]) => [key, value.trim()]),
      ),
      summary: summary.trim(),
      technicalSkills: Object.fromEntries(
        Object.entries(skills).map(([key, value]) => [key, splitList(value)]),
      ),
      experience: experience.map(entry => ({
        role: entry.title.trim(),
        organization: entry.organization.trim(),
        year: entry.year.trim(),
        description: entry.description.trim(),
      })),
      projects: projects.map(entry => ({
        name: entry.title.trim(),
        year: entry.year.trim(),
        technologies: splitList(entry.technologies),
        url: entry.url.trim(),
        description: entry.description.trim(),
      })),
    };
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/create-ats-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cvData),
      //  signal: AbortSignal.timeout(90000),
      });
      if (!response.ok) {
        if( response.status === 429) {
         
          throw new Error(
            'The generation limit has been reached. Please try again later'
        );

      }

      if ( response.status === 503) {
        throw new Error(
         
           'The AI service is busy. Please try again shortly'
        );
      }

      throw new Error(
            `Could not generate your CV (${response.status}), please try again later`,

      )
    }
      if (!response.headers.get('content-type')?.includes('application/pdf')) {
        throw new Error('The server did not return a PDF.');
      }

      const pdf = await response.blob();
      const url = URL.createObjectURL(pdf);

      setPdfUrl(url);
      setMessage('Download cv pdf')
      }
      catch (error) {
      setError(
        error instanceof Error && error.name === 'TimeoutError'
          ? 'Generation took too long. Please try again later.'
          : error instanceof TypeError
            ? 'Could not connect. Your entries are still here; please try again later.'
            : error instanceof Error
              ? error.message
              : 'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="app-shell">
      <header className="hero">
        <div className="lab-brand">Amel<span>.</span></div>
        <span className="eyebrow">CV GENERATOR</span>
        <h1>Your experience.<br /><span>Clearly presented.</span></h1>
        <p>
          Fill in your details. Refine your wording with AI.
          Download a clean, readable CV.
        </p>
        <span className="badge">PDF export · No account needed</span>
      </header>
      <form onSubmit={handleSubmit} aria-busy={loading}>
        <fieldset disabled={loading}>
          <section className="card">
            <h2>Contact details</h2>
            <p className="muted">Add your name and at least one way to contact you.</p>
            <div className="grid">
              <Field label="Full name" value={contact.fullName} required
                onChange={value => setContact(prev => ({ ...prev, fullName: value }))} />
              <Field label="Email" type="email" value={contact.email}
                onChange={value => setContact(prev => ({ ...prev, email: value }))} />
              <Field label="Phone number" type="tel" value={contact.phoneNumber}
                onChange={value => setContact(prev => ({ ...prev, phoneNumber: value }))} />
              <Field label="LinkedIn URL" type="url" value={contact.linkedin}
                onChange={value => setContact(prev => ({ ...prev, linkedin: value }))} />
              <Field label="GitHub URL" type="url" value={contact.github}
                onChange={value => setContact(prev => ({ ...prev, github: value }))} />
            </div>
          </section>
          <section className="card">
            <h2>Profile</h2>
            <Field label="Summary (optional)" value={summary}
              onChange={setSummary} multiline
              placeholder="A few sentences about your background and focus." />
          </section>
          <section className="card">
            <h2>Technical skills</h2>
            <p className="muted">Separate each skill with a comma.</p>
            <div className="grid">
              {(Object.keys(skills) as (keyof typeof skills)[]).map(key => (
                <Field key={key}
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={skills[key]}
                  onChange={value => setSkills(prev => ({ ...prev, [key]: value }))}
                />
              ))}
            </div>
          </section>
          <Entries kind="experience" entries={experience} onChange={setExperience} />
          <Entries kind="project" entries={projects} onChange={setProjects} />
          <Entries kind="education" entries={education} onChange={setEducation} />
          <section className="card">
            <p className="muted">
              Your entries are sent to Google Gemini to improve the wording.
              Review your PDF before using it. Refreshing this page clears the form.
            </p>
            <div className="actions">
              <button className="primary" type="submit">
                {loading ? 'Creating your CV…' : 'Generate my PDF'}
              </button>
              <button className="secondary" type="button" onClick={resetForm}>
                Clear form
              </button>
            </div>
          </section>
        </fieldset>
        {loading && <p className="status" role="status">Improving wording and preparing your PDF…</p>}
        {error && <p className="status error" role="alert">{error}</p>}
        {/* {message && <p className="status success" role="status">{message}</p>} */}
        {pdfUrl && (
          <a href={pdfUrl} className='status success' download="my-cv.pdf">
            Download PDF
          </a>  
          )}
      </form>
      <footer>Amel. Lab · Small tools. Real possibilities.</footer>
    </main>
  );
}