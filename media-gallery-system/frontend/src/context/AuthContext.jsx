import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { setToken, getToken } from '../services/api'
import authService from '../services/authService'

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
}

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      }
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      }
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      }
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }
    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken()
      
      if (token) {
        try {
          const response = await authService.getProfile()
          dispatch({
            type: AUTH_ACTIONS.SET_USER,
            payload: response.data.user,
          })
        } catch (error) {
          // Token is invalid, clear it
          setToken(null)
          dispatch({
            type: AUTH_ACTIONS.SET_USER,
            payload: null,
          })
        }
      } else {
        dispatch({
          type: AUTH_ACTIONS.SET_LOADING,
          payload: false,
        })
      }
    }

    initializeAuth()
  }, [])

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START })
      
      const response = await authService.login(email, password)
      const { token, user } = response.data
      
      setToken(token)
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user },
      })
      
      return response
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.response?.data?.message || 'Login failed',
      })
      throw error
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START })
      const response = await authService.register(userData)
      return response
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.response?.data?.message || 'Registration failed',
      })
      throw error
    }
  }

  // Verify email function
  const verifyEmail = async (email, otp) => {
    try {
      const response = await authService.verifyEmail(email, otp)
      const { token, user } = response.data
      
      setToken(token)
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user },
      })
      
      return response
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.response?.data?.message || 'Email verification failed',
      })
      throw error
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setToken(null)
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
    }
  }

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData)
      dispatch({
        type: AUTH_ACTIONS.SET_USER,
        payload: response.data.user,
      })
      return response
    } catch (error) {
      throw error
    }
  }

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }

  // Check if user is admin
  const isAdmin = () => {
    return state.user?.role === 'admin'
  }

  // Check if user is verified
  const isVerified = () => {
    return state.user?.isVerified === true
  }

  const value = {
    ...state,
    login,
    register,
    verifyEmail,
    logout,
    updateProfile,
    clearError,
    isAdmin,
    isVerified,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext