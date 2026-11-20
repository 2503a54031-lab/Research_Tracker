import React, { useEffect, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, LabelList, Pie, PieChart, PolarAngleAxis,
  PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  Activity, ArrowUpRight, CheckCircle2, FileText, FolderKanban, Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const chartColors = ['#4361ee', '#8b5cf6', '#16a085', '#f59e0b', '#e76f51', '#64748b'];

function projectStatusColor(status, index) {
  const normalizedStatus = status.toLowerCase();
  if (normalizedStatus.includes('complete')) return '#16a085';
  if (normalizedStatus.includes('progress')) return '#f59e0b';
  if (normalizedStatus.includes('hold')) return '#64748b';
  if (normalizedStatus.includes('planning')) return '#4361ee';
  return chartColors[index % chartColors.length];
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/dashboard').then(setData).catch((requestError) => setError(requestError.message));
  }, []);

  const cards = data ? [
    ['Research projects', data.project_count, FolderKanban, 'blue'],
    ['Publications', data.publication_count, FileText, 'purple'],
    ['Active projects', data.active_projects, Activity, 'orange'],
    ['Accepted papers', data.accepted_publications, CheckCircle2, 'green'],
  ] : [];
  const overviewTotals = data ? [
    { name: 'Research projects', value: data.project_count },
    { name: 'Publications', value: data.publication_count },
    { name: 'Active projects', value: data.active_projects },
    { name: 'Accepted papers', value: data.accepted_publications },
  ] : [];
  const largestMetric = Math.max(1, ...overviewTotals.map((metric) => metric.value));
  const overviewMetrics = overviewTotals.map((metric) => ({
    ...metric,
    relativeValue: Math.round((metric.value / largestMetric) * 100),
  }));

  return (
    <>
      <div className="welcome-row">
        <div>
          <span className="eyebrow">RESEARCH OVERVIEW</span>
          <h1>Your research at a glance</h1>
          <p className="muted">A clear view of your projects, papers, and progress.</p>
        </div>
        <Link className="primary-btn" to="/projects"><Plus size={17} /> New project</Link>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="stat-grid">
        {cards.map(([label, value, Icon, color]) => (
          <div className="stat-card" key={label}>
            <div className={`stat-icon ${color}`}><Icon size={20} /></div>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
            <div className="stat-foot">Your workspace</div>
          </div>
        ))}
      </div>

      {data && (
        <section className="panel overview-chart-panel">
          <div className="panel-heading">
            <div>
              <h3>Research at a glance</h3>
              <p className="muted">Relative scale: largest total is 100% · hover to inspect exact counts</p>
            </div>
            <span className="tag">WORKSPACE OVERVIEW</span>
          </div>
          <div className="overview-chart">
            <ResponsiveContainer width="100%" height={330}>
              <RadarChart data={overviewMetrics} cx="50%" cy="50%" outerRadius="72%">
                <PolarGrid gridType="circle" stroke="#e6ebf4" />
                <PolarAngleAxis
                  dataKey="name"
                  tick={{ fill: '#53677f', fontSize: 11, fontWeight: 600 }}
                  tickLine={false}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: '#98a4b4', fontSize: 9 }}
                  tickCount={5}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value, _name, item) => [
                    `${item.payload.value} total (${value}% of highest)`,
                    item.payload.name,
                  ]}
                />
                <defs>
                  <linearGradient id="overviewRadarFill" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4361ee" stopOpacity={0.75} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.28} />
                  </linearGradient>
                </defs>
                <Radar
                  name="Workspace totals"
                  dataKey="relativeValue"
                  stroke="#536dfe"
                  strokeWidth={3}
                  fill="url(#overviewRadarFill)"
                  fillOpacity={0.72}
                  dot={{ r: 5, fill: '#fff', stroke: '#536dfe', strokeWidth: 3 }}
                  activeDot={{ r: 7, fill: '#fff', stroke: '#8b5cf6', strokeWidth: 3 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="overview-metric-strip">
            {overviewMetrics.map((metric, index) => (
              <div className="overview-metric" key={metric.name}>
                <i className={`overview-metric-dot metric-${index}`} />
                <span>{metric.name}</span>
                <b>{metric.value}</b>
                <small>{metric.relativeValue}%</small>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="dashboard-grid visualization-grid">
        <section className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <h3>Project Status Distribution</h3>
              <p className="muted">A visual breakdown of your research stages</p>
            </div>
            <span className="tag">PROJECTS</span>
          </div>
          {data?.project_status?.length ? (
            <div className="distribution-content">
              <div className="distribution-donut">
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie
                      data={data.project_status}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={94}
                      paddingAngle={5}
                      stroke="none"
                    >
                      {data.project_status.map((item, index) => (
                        <Cell key={item.name} fill={projectStatusColor(item.name, index)} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-total">
                  <strong>{data.project_count}</strong>
                  <span>Total projects</span>
                </div>
              </div>
              <div className="distribution-legend">
                {data.project_status.map((item, index) => (
                  <div className="distribution-legend-item" key={item.name}>
                    <i style={{ background: projectStatusColor(item.name, index) }} />
                    <span>{item.name}</span>
                    <b>{item.value}</b>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <FolderKanban size={28} />
              <b>No project data yet</b>
              <span>Add a research project to see its status breakdown.</span>
              <Link to="/projects">Add project</Link>
            </div>
          )}
        </section>

        <section className="panel chart-panel">
          <div className="panel-heading">
            <div>
                <h3>Publication Status Distribution</h3>
                <p className="muted">Track papers from draft through publication</p>
            </div>
            <span className="tag">PUBLICATIONS</span>
          </div>
          {data?.publication_status?.length ? (
              <div className="publication-chart">
                <ResponsiveContainer width="100%" height={270}>
                  <BarChart
                    data={data.publication_status}
                    margin={{ top: 24, right: 10, bottom: 4, left: -20 }}
                    barCategoryGap="28%"
                  >
                    <CartesianGrid vertical={false} stroke="#edf0f6" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#68798e', fontSize: 10 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#8492a6', fontSize: 10 }}
                    />
                    <Tooltip cursor={{ fill: '#f5f7fb' }} />
                    <Bar dataKey="value" name="Publications" radius={[8, 8, 3, 3]} maxBarSize={46}>
                      {data.publication_status.map((item, index) => (
                        <Cell key={item.name} fill={chartColors[index % chartColors.length]} />
                      ))}
                      <LabelList dataKey="value" position="top" fill="#52627a" fontSize={11} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
          ) : (
            <div className="empty-state">
              <FileText size={28} />
              <b>No publication data yet</b>
              <span>Add a publication to see your pipeline.</span>
              <Link to="/publications">Add publication</Link>
            </div>
          )}
        </section>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>Quick actions</h3>
            <p className="muted">Keep your work moving</p>
          </div>
        </div>
        <div className="quick-links">
          <Link to="/projects">
            <span className="quick-icon blue"><FolderKanban /></span>
            <span><b>Add research project</b><small>Record a new research idea</small></span>
            <ArrowUpRight size={17} />
          </Link>
          <Link to="/publications">
            <span className="quick-icon purple"><FileText /></span>
            <span><b>Track publication</b><small>Log a paper or submission</small></span>
            <ArrowUpRight size={17} />
          </Link>
          <Link to="/assistant">
            <span className="quick-icon orange"><Activity /></span>
            <span><b>Writing helper</b><small>Structure your research draft</small></span>
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>

      <section className="panel recent-panel">
        <div className="panel-heading">
          <div>
            <h3>Recent research projects</h3>
            <p className="muted">Your latest workspace activity</p>
          </div>
          <Link to="/projects" className="text-link">View all <ArrowUpRight size={15} /></Link>
        </div>
        {data?.recent_projects?.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Project</th><th>Domain</th><th>Status</th><th>Target date</th></tr>
              </thead>
              <tbody>
                {data.recent_projects.map((project) => (
                  <tr key={project.id}>
                    <td className="strong-cell">{project.title}</td>
                    <td>{project.domain || '—'}</td>
                    <td><span className="status-pill">{project.status}</span></td>
                    <td>{project.target_date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-inline">
            No projects yet. <Link to="/projects">Create your first project</Link>.
          </div>
        )}
      </section>
    </>
  );
}
