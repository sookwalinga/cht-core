import { createReducer, on } from '@ngrx/store';

import { Actions as GlobalActions } from '@mm-actions/global';
import { Actions } from '@mm-actions/tasks';
import moment from 'moment';

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
  const getDueDate = (dueDate) => {
    if (typeof dueDate === 'number') {
      return dueDate;
    }
    if (moment(dueDate).isValid()) {
      return moment(dueDate).valueOf();
    }
    return NaN; //Invalid (bools/undefined/null/other)
  };

  const getPriorityValue = (priority) => {
    if (typeof priority === 'number') {
      return priority;
    }
    return NaN; // Invalid(bools/Strings/undefined/null/other)
  };

  const lhsDate = getDueDate(t1?.dueDate);
  const rhsDate = getDueDate(t2?.dueDate);

  const lhsPriority = getPriorityValue(t1?.priority);
  const rhsPriority = getPriorityValue(t2?.priority);

  if (isNaN(lhsDate) && isNaN(rhsDate)) {
    // Both tasks have no due date, maintain original order
    return 0;
  }

  if (isNaN(lhsDate)) {
    // lhs has no due date, rhs has a due date
    return 1; // lhs goes after rhs
  }
  if (isNaN(rhsDate)) {
    // rhs has no due date, lhs has a due date
    return -1; // lhs goes before rhs
  }

  // Sort by dueDate (earliest first)
  if (lhsDate !== rhsDate) {
    return lhsDate - rhsDate;
  }

  if (isNaN(lhsPriority) && isNaN(rhsPriority)) {
    // Both tasks have no valid priority, maintain original order
    return 0;
  }

  if (isNaN(lhsPriority)) {
    // lhs has no valid priority, rhs has a valid priority
    return -1; // lhs goes before rhs
  }
  if (isNaN(rhsPriority)) {
    // rhs has no valid priority, lhs has a valid priority
    return 1; // lhs goes after rhs
  }

  // Sort by priority (descending - higher priority first)
  if (lhsPriority !== rhsPriority) {
    return rhsPriority - lhsPriority;
  }
  // If both due date and priority are equal, maintain original order
  return 0;
};

const _tasksReducer = createReducer(
  initialState,
  on(GlobalActions.clearSelected, (state) => ({ ...state, selected: null })),

  on(Actions.setTasksList, (state, { payload: { tasks } }) => {
    console.info('<<<<<<<<<<<<SORTED TASKS>>>>>>>>>>>>>>>');
    console.info(
      [...tasks].sort(orderByDueDateAndPriority).map((t) => ({
        contact: t.contact?.name,
        title: t.title,
        dueDate: t.dueDate,
        priority: t.priority,
        priorityLabel: t.priorityLabel,
      }))
    );

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
