const testLogin = async (username, password, collegeId) => {
  try {
    console.log('\n=== Testing Login ===')
    console.log('Username:', username)
    console.log('Password:', password)
    console.log('College ID:', collegeId)
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        collegeId
      })
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', response.headers)
    
    const data = await response.json()
    console.log('Response data:', data)
    
    if (data.token) {
      console.log('✅ Login successful! Token received')
      console.log('User role:', data.user.role)
      console.log('User name:', data.user.name)
      return true
    } else {
      console.log('❌ Login failed:', data.message)
      return false
    }
  } catch (error) {
    console.error('❌ Login test failed:', error)
    return false
  }
}

// Test demo accounts
async function testDemoAccounts() {
  console.log('\n=== Testing Demo Accounts ===')
  
  const demoAccounts = [
    { username: 'admin', password: 'password', collegeId: '' },
    { username: 'teacher', password: 'password', collegeId: 'cmi334fc80000psgvici7ss5f' },
    { username: 'pc', password: 'password', collegeId: 'cmi334fc80000psgvici7ss5f' },
    { username: 'hod', password: 'password', collegeId: 'cmi334fc80000psgvici7ss5f' },
    { username: 'dean', password: 'password', collegeId: '' }
  ]
  
  for (const account of demoAccounts) {
    console.log(`\n--- Testing ${account.username} ---`)
    const success = await testLogin(account.username, account.password, account.collegeId)
    if (success) {
      console.log(`✅ ${account.username} login successful`)
    } else {
      console.log(`❌ ${account.username} login failed`)
    }
  }
}

// Test specific scenarios
async function testScenarios() {
  console.log('\n=== Testing Edge Cases ===')
  
  // Test wrong password
  console.log('\n--- Testing wrong password ---')
  await testLogin('admin', 'wrongpassword', '')
  
  // Test wrong username
  console.log('\n--- Testing wrong username ---')
  await testLogin('wronguser', 'password', '')
  
  // Test missing college (for non-admin)
  console.log('\n--- Testing missing college for teacher ---')
  await testLogin('teacher', 'password', '')
  
  // Test empty fields
  console.log('\n--- Testing empty fields ---')
  await testLogin('', '', '')
}

async function main() {
  await testDemoAccounts()
  await testScenarios()
  console.log('\n=== Login Testing Complete ===')
}

main().catch(console.error)