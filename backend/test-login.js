async function testLogin() {
    try {
        console.log('Testing login with default credentials...');
        const response = await fetch('http://localhost:4000/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'comisario@siscom.gov.co',
                password: 'Siscom2026!'
            })
        });

        const contentType = response.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
            if (response.ok) {
                console.log('Login Successful!');
                console.log('Token:', data.data.token ? 'Received' : 'Missing');
            } else {
                console.error('Login Failed!');
                console.error('Status:', response.status);
                console.error('Message:', data.message);
            }
        } else {
            console.error('Login Failed! Response is not JSON.');
            console.error('Status:', response.status);
            const text = await response.text();
            console.error('Response Text Peek:', text.substring(0, 200));
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function testServerUpdate() {
    try {
        console.log('Testing server update status...');
        const response = await fetch('http://localhost:4000/api/test-me');
        if (response.ok) {
            const text = await response.text();
            console.log('Server Status:', text);
        } else {
            console.error('Server Update Check Failed:', response.status);
        }
    } catch (e) {
        console.error('Server Update Check Error:', e.message);
    }
}

async function runTests() {
    await testServerUpdate();
    await testLogin();
}

runTests();
