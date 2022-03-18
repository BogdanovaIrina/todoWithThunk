import {todolistsAPI, TodolistType} from '../api/todolists-api'
import {Dispatch} from "redux"
import {RequestStatusType, setAppErrorAC, setAppStatusAC, SetAppStatusACtype} from "./app-reducer"

const initialState: Array<TodolistDomainType> = []

export type FilterValuesType = 'all' | 'active' | 'completed'

export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}

export const todolistsReducer = (state: Array<TodolistDomainType> = initialState, action: ActionsType): Array<TodolistDomainType> => {
    switch (action.type) {
        case 'GET-TODOS': {
            return action.todos.map(m => ({...m, filter:"all", entityStatus:"idle"}))
        }
        case 'REMOVE-TODOLIST': {
            return state.filter(tl => tl.id !== action.todolistId)
        }
        case 'ADD-TODOLIST': {
            return [{...action.todolist, filter:"all", entityStatus:"idle"}, ...state]
        }
        case 'CHANGE-TODOLIST-TITLE': {
           return state.map(tl => tl.id === action.id? {...tl, title:action.title} : tl)
        }
        case 'CHANGE-TODOLIST-FILTER': {
            return state.map(tl => tl.id === action.id? {...tl, filter:action.filter} : tl)
        }
        case "CHANGE-TODOLIST-ENTITY-STATUS": {
            return state.map(tl => tl.id === action.id? {...tl, entityStatus:action.entityStatus} : tl)
        }
        default:
            return state
    }
}

export const removeTodolistAC = (todolistId: string) => ({type: 'REMOVE-TODOLIST', todolistId} as const)
export const addTodolistAC = (todolist:TodolistType) => ({type: 'ADD-TODOLIST', todolist} as const)
export const changeTodolistTitleAC = (id: string, title: string) => ({type: 'CHANGE-TODOLIST-TITLE', id, title} as const)
export const changeTodolistFilterAC = (id: string, filter: FilterValuesType) => ({type: 'CHANGE-TODOLIST-FILTER', id, filter} as const)
export const getTodosAC = (todos: Array<TodolistType>) => ({type:'GET-TODOS', todos} as const)
export const changeTodolistEntityStatusAC = (id: string, entityStatus: RequestStatusType) => ({type: 'CHANGE-TODOLIST-ENTITY-STATUS', id, entityStatus} as const)

export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>
export type AddTodolistActionType = ReturnType<typeof addTodolistAC>
export type ChangeTodolistTitleActionType = ReturnType<typeof changeTodolistTitleAC>
export type ChangeTodolistFilterActionType = ReturnType<typeof changeTodolistFilterAC>
export type GetTodosACType = ReturnType<typeof getTodosAC>
export type ChangeTodolistEntityStatusAC = ReturnType<typeof changeTodolistEntityStatusAC>

type ActionsType = RemoveTodolistActionType
    | AddTodolistActionType
    | ChangeTodolistTitleActionType
    | ChangeTodolistFilterActionType
    | GetTodosACType
    | SetAppStatusACtype
    | ChangeTodolistEntityStatusAC



//Thunk
export const getTodosThunk = (dispatch:Dispatch<ActionsType>)=> {
    dispatch(setAppStatusAC('loading'))
    todolistsAPI.getTodolists()
        .then((response) => {
            dispatch(getTodosAC(response.data))
            dispatch(setAppStatusAC('succeeded'))
        })
}

export const removeTodolistTC = (todolistId: string) => {
    return (dispatch: Dispatch) => {
        dispatch(setAppStatusAC('loading'))
        dispatch(changeTodolistEntityStatusAC(todolistId,'loading'))
        todolistsAPI.deleteTodolist(todolistId)
            .then((response) => {
                dispatch(removeTodolistAC(todolistId))
                dispatch(setAppStatusAC('succeeded'))

            })
    }}
export const addTodolistTC = (title: string) => {
    return (dispatch: Dispatch) => {
        dispatch(setAppStatusAC('loading'))
        todolistsAPI.createTodolist(title)
            .then((response) => {
                if (response.data.resultCode === 0) {
                    dispatch(addTodolistAC(response.data.data.item))
                    dispatch(setAppStatusAC('succeeded'))
                } else {
                    dispatch(setAppErrorAC(response.data.messages[0]))
                    dispatch(setAppStatusAC('failed'))
                }

            })
    }}
export const changeTodolistTitleTC = (todolistId: string, title: string) => {
    return (dispatch: Dispatch) => {
        todolistsAPI.updateTodolist(todolistId, title)
            .then((response) => {
                if (response.data.resultCode === 0) {
                    dispatch(changeTodolistTitleAC(todolistId, title))
                    dispatch(setAppStatusAC('succeeded'))
                } else {
                    dispatch(setAppStatusAC('failed'))
                }
            })
    }}
