import { CognitoUser } from '@aws-amplify/auth';
import { createAsyncThunk, createSlice, SerializedError } from '@reduxjs/toolkit';
import { Auth, Hub } from 'aws-amplify';
import { GuestLogin } from 'src/conf/content';
import IUser, { mapInUser } from './user';

interface ILoginParams {
  email: string;
  password: string;
}
export interface AuthState {
  isLoading: boolean;
  error: SerializedError | string;
  user: IUser | null;
}

const saveToStorage = (user: IUser) => {
  localStorage.setItem('User', JSON.stringify(user));
};

const login = createAsyncThunk<
  // Return type of the payload creator
  IUser,
  // First argument to the payload creator
  ILoginParams
  // Types for ThunkAPI
>('auth/login', async ({ email, password }, thunkApi) => {
  const cognitoUser = await Auth.signIn(email, password);
  const user = mapInUser(cognitoUser);
  saveToStorage(user);
  return user;
});

const logout = createAsyncThunk<// Return type of the payload creator
IUser>('auth/logout', async () => {
  // First argument to the payload creator
  const { email, password } = GuestLogin;
  const cognitoUser = await Auth.signIn(email, password);
  const user = mapInUser(cognitoUser);
  saveToStorage(user);
  return user;
});

const isAuthenticated = createAsyncThunk<// Return type of the payload creator
IUser>('auth/isAuthenticatd', async () => {
  let cognitoUser: CognitoUser;
  // try {
  //   cognitoUser = await Auth.currentAuthenticatedUser();

  // } catch (err) {
  //   if (err === 'The user is not authenticated') {
  //     // If not loggin in then login as guest
  //     const { email, password } = GuestLogin;
  //     cognitoUser = await Auth.signIn(email, password);
  //   } else {
  //     throw err;
  //   }
  // }

  try {
    const unauthUser = await Auth.currentCredentials();
    console.log('unauthUser', unauthUser);
  } catch (err) {
    console.log(err);
  }

  // const user = mapInUser(cognitoUser);
  // saveToStorage(user);
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isLoading: true,
    error: '',
    user: null,
  } as AuthState,
  reducers: {},

  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(login.rejected, (state, action: any) => {
      state.isLoading = false;
      state.error = action.error;
    });
    builder.addCase(login.fulfilled, (state, { payload }) => {
      state.isLoading = false;
      state.user = payload;
    });
    // Logout
    builder.addCase(logout.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(logout.rejected, (state, action: any) => {
      state.isLoading = false;
      state.error = action.error;
    });
    builder.addCase(logout.fulfilled, (state, { payload }) => {
      state.isLoading = false;
      state.user = payload;
    });
    // IsAuthenticated
    builder.addCase(isAuthenticated.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(isAuthenticated.rejected, (state, action: any) => {
      state.isLoading = false;
      state.error = action.error;
    });
    builder.addCase(isAuthenticated.fulfilled, (state, { payload }) => {
      state.isLoading = false;
      state.user = payload;
    });
  },
});

// Export Actions

export const loginActionCreator = login;
export const logoutActionCreator = logout;
export const isAuthenticatedActionCreator = isAuthenticated;

export default authSlice.reducer;
