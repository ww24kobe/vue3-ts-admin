import axios from 'axios'

async function run() {
  interface loginUser {
    success: boolean
    code: number
    message: string
    data: {
      token: string
    }
  }

  const res = await axios.get<loginUser>('/')
  res.data.data.token
}

async function run2() {
  axios.interceptors.response.use((res) => {
    return res.data.data
  })

  interface loginUser {
    token: string
  }

  const res = (await axios.get('/')) as loginUser
  res.token
}
