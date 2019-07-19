import { config as configTask } from './../config/task';

export function isAssignedToMe(task, userId) {
  let assignedToMe = false;
  const assignees = task.assignees;

  for (let i = 0; i < assignees.length; i++) {
    if (assignees[i].user == userId) {
      assignedToMe = true;
      break;
    }
  }

  return assignedToMe;
}

export function isDoneTask(task, userId) {
  let isDone = false;
  const assignees = task.assignees;

  for (let i = 0; i < assignees.length; i++) {
    if (
      assignees[i].user == userId &&
      (assignees[i].percent == 100 || assignees[i].status == configTask.STATUS.DONE.VALUE)
    ) {
      isDone = true;
      break;
    }
  }

  return isDone;
}
