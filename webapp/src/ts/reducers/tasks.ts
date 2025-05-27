import { createReducer, on } from '@ngrx/store';

import { Actions as GlobalActions } from '@mm-actions/global';
import { Actions } from '@mm-actions/tasks';

const initialState = {
  tasksList: [] as any[],
  selected: null,
  loaded: false,
  taskGroup: {
    lastSubmittedTask: null,
    contact: null,
    loadingContact: null as any,
  },
};

// const orderByDueDateAndPriority = (t1, t2) => {
//   const lhs = t1?.dueDate;
//   const rhs = t2?.dueDate;
//   if (!lhs && !rhs) {
//     return 0;
//   }
//   if (!lhs) {
//     return 1;
//   }
//   if (!rhs) {
//     return -1;
//   }

//   return lhs < rhs ? -1 : 1;
// };

/**
 * Task prioritization algorithm that combines:
 * 1. Overdue status (most urgent)
 * 2. Due today status (high urgency)
 * 3. Priority (importance)
 * 4. Due date (soonest first)
 * 5. Tasks without due dates (lowest priority)
 *
 * Sorting rules (in order):
 * 1. Overdue tasks appear first (most urgent), sorted by priority (higher first)
 * 2. Tasks due today appear next, sorted by priority (higher first)
 * 3. Then sort other dates too by date and priority (high to low)
 * 4. For equal priority, sort by due date (earlier first)
 * 5. Tasks without due dates and/or priorities appear last
 */

const orderByDueDateAndPriority = (t1, t2) => {
  // Handle dueDate comparison
  const lhsDate = typeof t1?.dueDate === 'number' ? t1.dueDate : Infinity;
  const rhsDate = typeof t2?.dueDate === 'number' ? t2.dueDate : Infinity;

  // Handle priority comparison (strings are considered low priority)
  const getPriorityValue = (priority) => {
    if (typeof priority === 'number') {
      return priority;
    }
    if (typeof priority === 'string') {
      return -Infinity;
    } // Strings are lowest
    return 0; // undefined/null/other
  };

  const lhsPriority = getPriorityValue(t1?.priority);
  const rhsPriority = getPriorityValue(t2?.priority);

  // First sort by dueDate
  if (lhsDate !== rhsDate) {
    return lhsDate - rhsDate;
  }

  // If dueDates are equal, sort by priority (descending - higher priority first)
  if (lhsPriority !== rhsPriority) {
    return rhsPriority - lhsPriority;
  }

  // If both are equal, maintain original order
  return 0;
};

const _tasksReducer = createReducer(
  initialState,
  on(GlobalActions.clearSelected, (state) => ({ ...state, selected: null })),

  on(Actions.setTasksList, (state, { payload: { tasks } }) => {
    return {
      ...state,
      tasksList: [...tasks].sort(orderByDueDateAndPriority),
    };
  }),

  on(Actions.setTasksLoaded, (state, { payload: { loaded } }) => ({
    ...state,
    loaded,
  })),

  on(Actions.setSelectedTask, (state, { payload: { selected } }) => ({
    ...state,
    selected,
  })),

  on(Actions.setLastSubmittedTask, (state, { payload: { task } }) => ({
    ...state,
    tasksList: state.tasksList.filter((t) => task?._id !== t._id),
    taskGroup: {
      ...state.taskGroup,
      lastSubmittedTask: task,
    },
  })),

  on(Actions.setTaskGroupContact, (state, { payload: { contact } }) => ({
    ...state,
    taskGroup: {
      ...state.taskGroup,
      contact,
      loadingContact: false,
    },
  })),

  on(Actions.setTaskGroupContactLoading, (state, { payload: { loading } }) => ({
    ...state,
    taskGroup: {
      ...state.taskGroup,
      loadingContact: loading,
    },
  })),

  on(Actions.setTaskGroup, (state, { payload: { taskGroup } }) => ({
    ...state,
    taskGroup: {
      lastSubmittedTask:
        taskGroup.lastSubmittedTask || state.taskGroup.lastSubmittedTask,
      contact: taskGroup.contact || state.taskGroup.contact,
      loadingContact:
        taskGroup.loadingContact || state.taskGroup.loadingContact,
    },
  })),

  on(Actions.clearTaskGroup, (state) => ({
    ...state,
    taskGroup: { ...initialState.taskGroup },
  }))
);

export const tasksReducer = (state, action) => {
  return _tasksReducer(state, action);
};
