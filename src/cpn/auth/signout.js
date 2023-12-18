import { useEffect } from "react"
import { useSelector } from "react-redux"
export default () => {
    const { socket, auth } = useSelector(state => state)

    useEffect(() => {
        socket.emit("/dipe-production-user-logout", { username: auth.username })

        localStorage.removeItem('_token')


        localStorage.removeItem("password_hash");
        localStorage.removeItem("user");
        localStorage.setItem("user", JSON.stringify({}));
        localStorage.removeItem("selectedCaseDetail")
        // console.log( localStorage.getItem("_token") )
        window.location = "/login"
    }, [])
    return null
}