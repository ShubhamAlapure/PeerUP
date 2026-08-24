import express from 'express';
import {
  seedInstitutions,
  seedDepartments,
  seedPrograms,
  seedYears,
  seedSemesters,
  seedSubjects,
  seedTopics
} from '../db/seedData.js';

const router = express.Router();

let institutionsList = [...seedInstitutions];

/**
 * @route GET /api/institutions
 * @desc Get & search institutions by name, city, state, type
 */
router.get('/institutions', (req, res) => {
  const { query, city, state, type } = req.query;
  let results = [...institutionsList];

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(inst =>
      inst.name.toLowerCase().includes(q) ||
      inst.city.toLowerCase().includes(q) ||
      inst.state.toLowerCase().includes(q)
    );
  }

  if (city) {
    results = results.filter(inst => inst.city.toLowerCase() === city.toLowerCase());
  }

  if (state) {
    results = results.filter(inst => inst.state.toLowerCase() === state.toLowerCase());
  }

  if (type) {
    results = results.filter(inst => inst.type.toLowerCase() === type.toLowerCase());
  }

  res.json(results);
});

/**
 * @route GET /api/institutions/:id
 * @desc Get single institution by ID
 */
router.get('/institutions/:id', (req, res) => {
  const inst = institutionsList.find(i => i.id === req.params.id);
  if (!inst) {
    return res.status(404).json({ error: 'Institution not found.' });
  }
  res.json(inst);
});

/**
 * @route GET /api/institutions/:id/academic-tree
 * @desc Get full academic tree hierarchy for an institution
 */
router.get('/institutions/:id/academic-tree', (req, res) => {
  const instId = req.params.id;
  const depts = seedDepartments.filter(d => d.institution_id === instId);

  const tree = depts.map(dept => {
    const progs = seedPrograms.filter(p => p.department_id === dept.id);
    const hydratedProgs = progs.map(prog => {
      const yrs = seedYears.filter(y => y.program_id === prog.id);
      const hydratedYrs = yrs.map(yr => {
        const sems = seedSemesters.filter(s => s.year_id === yr.id);
        const hydratedSems = sems.map(sem => {
          const subjs = seedSubjects.filter(sub => sub.semester_id === sem.id);
          const hydratedSubjs = subjs.map(subj => {
            const tops = seedTopics.filter(t => t.subject_id === subj.id);
            return { ...subj, topics: tops };
          });
          return { ...sem, subjects: hydratedSubjs };
        });
        return { ...yr, semesters: hydratedSems };
      });
      return { ...prog, years: hydratedYrs };
    });
    return { ...dept, programs: hydratedProgs };
  });

  res.json({
    institutionId: instId,
    departments: tree
  });
});

/**
 * @route GET /api/subjects
 * @desc Get all subjects or search subjects
 */
router.get('/subjects', (req, res) => {
  const { query } = req.query;
  let results = [...seedSubjects];
  if (query) {
    const q = query.toLowerCase();
    results = results.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
  }
  res.json(results);
});

/**
 * @route GET /api/topics
 * @desc Get topics by subject ID
 */
router.get('/topics', (req, res) => {
  const { subject_id } = req.query;
  let results = [...seedTopics];
  if (subject_id) {
    results = results.filter(t => t.subject_id === subject_id);
  }
  res.json(results);
});

export default router;
