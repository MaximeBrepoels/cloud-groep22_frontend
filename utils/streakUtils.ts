import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = 'user_streak';
const LAST_LOGIN_KEY = 'last_login';

export const updateStreak = async () => {
    const today = new Date().toISOString().split('T')[0]; // Gets today's date in YYYY-MM-DD format
    const lastLogin = await AsyncStorage.getItem(LAST_LOGIN_KEY); // Gets the date of the last time the user logged in

    let streak = parseInt(await AsyncStorage.getItem(STREAK_KEY) || '0', 10);

    // This calculates the date for yesterday and formats it to YYYY-MM-DD
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastLogin === today) {
        // User has already logged in today
        return streak;
    }

    if (lastLogin === yesterdayStr) {
        // User logged in yesterday, increment streak
        streak += 1;
    } else {
        // User did not log in yesterday, reset streak
        streak = 1;
    }

    await AsyncStorage.setItem(STREAK_KEY, streak.toString()); // New streak value is saved to AsyncStorage
    await AsyncStorage.setItem(LAST_LOGIN_KEY, today); // Today's login date is saved to AsyncStorage

    return streak;
};
