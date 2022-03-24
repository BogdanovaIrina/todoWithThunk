import React, {useCallback, useEffect} from 'react'
import './App.css';
import { Todolist } from './components/Todolist';
import { AddItemForm } from './components/AddItemForm';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Menu } from '@mui/icons-material';
import {addTodolistTC, changeTodolistFilterAC, changeTodolistTitleTC, FilterValuesType,getTodosThunk, removeTodolistTC, TodolistDomainType} from './state/todolists-reducer'
import {addTaskTC, removeTasksTC, updateTaskStatusTC, updateTaskTitleTC} from './state/tasks-reducer';
import { useDispatch, useSelector } from 'react-redux';
import { AppRootStateType } from './state/store';
import {TaskStatuses, TaskType} from './api/todolists-api'
import LinearProgress from "@mui/material/LinearProgress";
import {RequestStatusType} from "./state/app-reducer";
import {ErrorSnackbar} from "./components/ErrorSnackbar";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Login} from "./features/Login";

export type TasksStateType = {
    [key: string]: Array<TaskType>
}

function App() {

    useEffect(()=>{dispatch(getTodosThunk)}, [])

    const todolists = useSelector<AppRootStateType, Array<TodolistDomainType>>(state => state.todolists)
    const tasks = useSelector<AppRootStateType, TasksStateType>(state => state.tasks)
    const status = useSelector<AppRootStateType, RequestStatusType>(state => state.app.status)

    const dispatch = useDispatch()

    const removeTask = useCallback(function (id: string, todolistId: string) {dispatch(removeTasksTC(id,todolistId))}, [])
    const addTask = useCallback(function (title: string, todolistId: string) {dispatch(addTaskTC(todolistId, title))}, [])
    const changeStatus = useCallback(function (id: string, status: TaskStatuses, todolistId: string) {dispatch(updateTaskStatusTC(id, status, todolistId))}, [])
    const changeTaskTitle = useCallback(function (id: string, newTitle: string, todolistId: string) {dispatch(updateTaskTitleTC(id, newTitle, todolistId))}, [])

    const changeFilter = useCallback(function (value: FilterValuesType, todolistId: string) {dispatch(changeTodolistFilterAC(todolistId, value))}, []);
    const removeTodolist = useCallback(function (id: string) {dispatch(removeTodolistTC(id))}, [])
    const changeTodolistTitle = useCallback(function (id: string, title: string) {dispatch(changeTodolistTitleTC(id, title))}, [])
    const addTodolist = useCallback((title: string) => {dispatch(addTodolistTC(title))}, [dispatch])

    return (

            <div className="App">
                <AppBar position="static">
                    <Toolbar>
                        <IconButton edge="start" color="inherit" aria-label="menu">
                            <Menu/>
                        </IconButton>
                        <Typography variant="h6">
                            News
                        </Typography>
                        <Button color="inherit">Login</Button>
                    </Toolbar>
                </AppBar>

                {status === 'loading' && <LinearProgress color="secondary"/>}

                <Container fixed>


                    <Grid container style={{padding: '20px'}}>
                        <AddItemForm addItem={addTodolist}/>
                    </Grid>
                    <Grid container spacing={3}>
                        {
                            todolists.map(tl => {
                                let allTodolistTasks = tasks[tl.id];

                                return <Grid item key={tl.id}>
                                    <Paper style={{padding: '10px'}}>
                                        <Todolist id={tl.id} title={tl.title} entityStatus={tl.entityStatus} filter={tl.filter} removeTodolist={removeTodolist} changeTodolistTitle={changeTodolistTitle} changeFilter={changeFilter} tasks={allTodolistTasks} addTask={addTask} removeTask={removeTask} changeTaskTitle={changeTaskTitle} changeTaskStatus={changeStatus} />
                                    </Paper>
                                </Grid>
                            })
                        }
                    </Grid>

                </Container>

                <ErrorSnackbar/>
            </div>


    )
}

export default App
