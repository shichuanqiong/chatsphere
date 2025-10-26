// Debug script to check guest user storage
// Run this in browser console

console.log('=== ChatSphere Users ===');
const users = JSON.parse(localStorage.getItem('chatsphere_users') || '[]');
console.log('Total users:', users.length);
console.log('Users:', users);

console.log('\n=== Current User ===');
const currentUser = JSON.parse(localStorage.getItem('chatsphere_current_user') || 'null');
console.log('Current user:', currentUser);

console.log('\n=== Guest Users ===');
const guestUsers = users.filter(u => u.id && u.id.startsWith('guest-'));
console.log('Guest users:', guestUsers);

console.log('\n=== Registered Users ===');
const registeredUsers = users.filter(u => u.id && !u.id.startsWith('guest-'));
console.log('Registered users:', registeredUsers);

