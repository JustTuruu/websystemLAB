import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useAuth } from "./AuthContext";

const API_URL = "http://localhost:5001/api";

// Initial state for places
const initialState = {
  places: [],
  loading: false,
  error: null,
};

// Action types
const actionTypes = {
  SET_PLACES: "SET_PLACES",
  ADD_PLACE: "ADD_PLACE",
  UPDATE_PLACE: "UPDATE_PLACE",
  DELETE_PLACE: "DELETE_PLACE",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
};

// Reducer function
function placesReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_PLACES:
      return {
        ...state,
        places: action.payload,
      };

    case actionTypes.ADD_PLACE:
      return {
        ...state,
        places: [...state.places, action.payload],
      };

    case actionTypes.UPDATE_PLACE:
      return {
        ...state,
        places: state.places.map((place) =>
          place._id === action.payload._id ? action.payload : place
        ),
      };

    case actionTypes.DELETE_PLACE:
      return {
        ...state,
        places: state.places.filter((place) => place._id !== action.payload),
      };

    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
}

// Create Context
const PlacesContext = createContext();

// Context Provider Component
export function PlacesProvider({ children }) {
  const [state, dispatch] = useReducer(placesReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Fetch all places from API
  const fetchPlaces = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.log("No token, skipping places fetch");
      return;
    }

    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const response = await fetch(`${API_URL}/places`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Газруудыг татахад алдаа гарлаа");
      const data = await response.json();
      dispatch({ type: actionTypes.SET_PLACES, payload: data });
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    } catch (error) {
      console.error("Error fetching places:", error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  // Load places when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchPlaces();
    }
  }, [isAuthenticated]);

  // Action creators
  const addPlace = async (placeData) => {
    if (!user) {
      throw new Error("Газар нэмэхийн тулд нэвтрэх шаардлагатай");
    }

    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const response = await fetch(`${API_URL}/places`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          ...placeData,
          userId: user._id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Газар нэмэхэд алдаа гарлаа");
      }

      const newPlace = await response.json();
      dispatch({ type: actionTypes.ADD_PLACE, payload: newPlace });
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
      return newPlace;
    } catch (error) {
      console.error("Error adding place:", error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
      throw error;
    }
  };

  const updatePlace = async (place) => {
    if (!user) {
      throw new Error("Газрын мэдээлэл засахын тулд нэвтрэх шаардлагатай");
    }

    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const response = await fetch(`${API_URL}/places/${place._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          ...place,
          userId: user._id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Газрын мэдээлэл засахад алдаа гарлаа");
      }

      const updatedPlace = await response.json();
      dispatch({ type: actionTypes.UPDATE_PLACE, payload: updatedPlace });
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
      return updatedPlace;
    } catch (error) {
      console.error("Error updating place:", error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
      throw error;
    }
  };

  const deletePlace = async (id) => {
    if (!user) {
      throw new Error("Газар устгахын тулд нэвтрэх шаардлагатай");
    }

    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const response = await fetch(`${API_URL}/places/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          userId: user._id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Газар устгахад алдаа гарлаа");
      }

      dispatch({ type: actionTypes.DELETE_PLACE, payload: id });
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    } catch (error) {
      console.error("Error deleting place:", error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
      throw error;
    }
  };

  const setLoading = (loading) => {
    dispatch({ type: actionTypes.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: actionTypes.SET_ERROR, payload: error });
  };

  const value = {
    ...state,
    addPlace,
    updatePlace,
    deletePlace,
    setLoading,
    setError,
    fetchPlaces,
  };

  return (
    <PlacesContext.Provider value={value}>{children}</PlacesContext.Provider>
  );
}

// Custom hook to use Places Context
export function usePlaces() {
  const context = useContext(PlacesContext);
  if (!context) {
    throw new Error("usePlaces must be used within a PlacesProvider");
  }
  return context;
}

export default PlacesContext;
