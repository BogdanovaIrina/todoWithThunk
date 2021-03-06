import { TasksStateType } from '../App';
import { v1 } from 'uuid';
import {AddTodolistActionType, GetTodosACType, RemoveTodolistActionType} from './todolists-reducer';
import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../api/todolists-api'
import {Dispatch} from "redux";
import {AppRootStateType} from "./store";
import {setAppErrorAC, setAppStatusAC} from "./app-reducer";
import {AxiosError} from "axios";

export type RemoveTaskActionType = ReturnType<typeof removeTaskAC>
export type AddTaskActionType = ReturnType<typeof addTaskAC>
export type ChangeTaskStatusActionType = ReturnType<typeof changeTaskStatusAC>
export type ChangeTaskTitleActionType = ReturnType<typeof changeTaskTitleAC>

type ActionsType = RemoveTaskActionType
    | AddTaskActionType
    | ChangeTaskStatusActionType
    | ChangeTaskTitleActionType
    | AddTodolistActionType
    | RemoveTodolistActionType
    | GetTodosACType
    | SetTasksACType

const initialState: TasksStateType = {}

export const tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
    switch (action.type) {
        case "SET-TASKS":{
            const stateCopy = {...state}
            stateCopy[action.todoId] = action.tasks
            return stateCopy
        }
        case "GET-TODOS":{
            const stateCopy = {...state}
            action.todos.forEach((f) => {
                stateCopy[f.id] = []
            })
            return stateCopy
        }
        case 'REMOVE-TASK': {
            return {...state, [action.todolistId]:state[action.todolistId].filter(f=>f.id !== action.taskId)}
        }
        case 'ADD-TASK': {
            const stateCopy = {...state}
            const tasks = stateCopy[action.task.todoListId];
            const newTasks = [action.task, ...tasks];
            stateCopy[action.task.todoListId] = newTasks;
            return stateCopy;
        }
        case 'CHANGE-TASK-STATUS': {
            let todolistTasks = state[action.todolistId];
            let newTasksArray = todolistTasks.map(t => t.id === action.taskId ? {...t, status: action.status} : t);

            state[action.todolistId] = newTasksArray;
            return ({...state});
        }
        case 'CHANGE-TASK-TITLE': {
            let todolistTasks = state[action.todolistId];
            let newTasksArray = todolistTasks.map(t => t.id === action.taskId ? {...t, title: action.title} : t);

            state[action.todolistId] = newTasksArray;
            return ({...state});
        }
        case 'ADD-TODOLIST': {
            return {...state, [action.todolist.id]: []}
        }
        case 'REMOVE-TODOLIST': {
            const copyState = {...state};
            delete copyState[action.todolistId];
            return copyState;
        }
        default:
            return state;
    }
}

export const removeTaskAC = (taskId: string, todolistId: string) => ({type: 'REMOVE-TASK', taskId: taskId, todolistId: todolistId} as const)
export const addTaskAC = (task:TaskType) => ({type: 'ADD-TASK', task} as const)
export const changeTaskStatusAC = (taskId: string, status: TaskStatuses, todolistId: string) => ({type: 'CHANGE-TASK-STATUS', status, todolistId, taskId} as const)
export const changeTaskTitleAC = (taskId: string, title: string, todolistId: string) => ({type: 'CHANGE-TASK-TITLE', title, todolistId, taskId} as const)
export const setTasksAC = (todoId:string, tasks:TaskType[]) => ({type:"SET-TASKS", todoId, tasks} as const)

type SetTasksACType = ReturnType<typeof setTasksAC>

//thunk-????????????????
export const getTasksTC = (todolistId:string) => (dispatch: Dispatch) => {
        todolistsAPI.getTasks(todolistId)
            .then((response)=>{
                dispatch(setTasksAC(todolistId, response.data.items))
            })
}
export const removeTasksTC = (taskId: string, todolistId: string) => (dispatch: Dispatch) => {
        dispatch(setAppStatusAC('loading'))
        todolistsAPI.deleteTask(todolistId, taskId)
            .then((response) => {
                dispatch(removeTaskAC(taskId, todolistId))
                dispatch(setAppStatusAC('succeeded'))
            })
    }
export const addTaskTC = (todolistId:string, title:string) => (dispatch:Dispatch) => {
        dispatch(setAppStatusAC('succeeded'))
        todolistsAPI.createTask(todolistId, title)
            .then((response) => {
                if (response.data.resultCode === 0) {
                dispatch(addTaskAC(response.data.data.item))
                } else {
                    dispatch(setAppErrorAC(response.data.messages[0]))
                }
            })
            // .catch((err:AxiosError)=>{
            //     dispatch(setAppErrorAC(err.message))
            //     dispatch(setAppStatusAC('failed'))
            // })
            .finally(()=>{
                dispatch(setAppStatusAC('failed'))
            })

}
export const updateTaskStatusTC = (id: string, status: TaskStatuses, todolistId: string) => (dispatch:Dispatch, getState: () => AppRootStateType) => {

    const allAppState = getState()
    const allTasks = allAppState.tasks
    const tasksForCurrentTodo = allTasks[todolistId]

    const currentTask = tasksForCurrentTodo.find((t)=>{
        return t.id === id
    })

    if (currentTask) {
        const model:UpdateTaskModelType = {
            title: currentTask.title,
            status,
            deadline:currentTask.deadline,
            startDate:currentTask.startDate,
            description: currentTask.description,
            priority:currentTask.priority
        }

        todolistsAPI.updateTask(todolistId, id, model)
            .then ((response) => {
                dispatch(changeTaskStatusAC(id, status, todolistId))
            })
    }

}
export const updateTaskTitleTC = (id: string, title: string, todolistId: string) => (dispatch:Dispatch, getState: () => AppRootStateType) => {

    const allAppState = getState()
    const allTasks = allAppState.tasks
    const tasksForCurrentTodo = allTasks[todolistId]

    const currentTask = tasksForCurrentTodo.find((t)=>{
        return t.id === id
    })

    if (currentTask) {
        const model:UpdateTaskModelType = {
            title,
            status: currentTask.status,
            deadline:currentTask.deadline,
            startDate:currentTask.startDate,
            description: currentTask.description,
            priority:currentTask.priority
        }

        todolistsAPI.updateTask(todolistId, id, model)
            .then ((response) => {
                dispatch(changeTaskTitleAC(id, title, todolistId))
            })
    }

}








