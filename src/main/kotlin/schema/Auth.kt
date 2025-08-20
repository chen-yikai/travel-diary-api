package schema

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class AuthRequest(
    val userEmailAddress: String,
    val userPassword: String
)

@Serializable
data class AuthResponse(
    val data: AuthData,
    val msg: String
)

@Serializable
data class AuthData(
    @SerialName("auth_token") val authToken: String
)