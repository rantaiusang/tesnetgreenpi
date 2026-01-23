export async function loginPi() {
  Pi.init({ version: "2.0" })

  const auth = await Pi.authenticate(
    ['username'],
    () => console.log('Pi auth incomplete')
  )

  return auth.user.uid
}
