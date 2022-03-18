export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'

const initialState = {
    status: 'loading' as RequestStatusType,
    error: null as string | null
}

type InitialStateType = typeof initialState

export const appReducer = (state: InitialStateType = initialState, action: ActionsType): InitialStateType => {
    switch (action.type) {
        case 'APP/SET-STATUS':
            return {...state, status: action.status}
        case 'APP/SET-ERROR':
            return {...state, error: action.error}
        default:
            return state
    }
}

export const setAppStatusAC = (status:RequestStatusType) => ({type: 'APP/SET-STATUS', status} as const )
export const setAppErrorAC = (error:null|string) => ({type: 'APP/SET-ERROR', error} as const )

export type SetAppStatusACtype = ReturnType<typeof setAppStatusAC>
export type SetAppErrorACtype = ReturnType<typeof setAppErrorAC>

type ActionsType = SetAppStatusACtype|SetAppErrorACtype