package dev.eliaschen

import dev.eliaschen.schema.FavoriteDiaryData
import dev.eliaschen.schema.FavoriteDiaryGetResponse
import dev.eliaschen.schema.FavoriteDiaryResponse
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.http.content.defaultResource
import io.ktor.server.http.content.resources
import io.ktor.server.http.content.static
import io.ktor.server.http.content.staticResources
import io.ktor.server.request.receive
import io.ktor.server.request.receiveParameters
import io.ktor.server.response.*
import io.ktor.server.routing.*
import schema.AuthRequest
import schema.AuthResponse
import schema.AuthData
import java.text.SimpleDateFormat
import java.util.Date
import java.util.UUID

fun Application.configureRouting() {
    val users = mutableMapOf<String, String>()
    val favorites = mutableListOf<FavoriteDiaryData>()

    routing {
        post("/api/users/signin") {
            val user = call.receive<AuthRequest>()
            val email = user.userEmailAddress
            val password = user.userPassword
            val emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\$".toRegex()

            try {
                when {
                    !email.matches(emailRegex) -> throw Exception("Invalid email format")

                    password.length < 6 || !password.any { it.isDigit() } || !password.any { it.isLetter() } -> throw Exception(
                        "Invalid password"
                    )
                }

                if (!users.containsKey(email)) {
                    val token = UUID.randomUUID().toString().replace("-", "")
                    users[email] = token
                    call.respond(
                        HttpStatusCode.OK,
                        AuthResponse(msg = "Sign in successful", data = AuthData(authToken = token))
                    )
                } else {
                    call.respond(
                        HttpStatusCode.OK,
                        AuthResponse(msg = "Sign in successful", data = AuthData(authToken = users[email]!!))
                    )
                }
            } catch (e: Exception) {
                call.respond(
                    HttpStatusCode.BadRequest,
                    AuthResponse(msg = e.message ?: "Invalid auth format", data = AuthData(authToken = ""))
                )
            }
        }

        get("/api/users") {
            call.respond(HttpStatusCode.OK, users)
        }

        put("/api/diary/collection") {
            val token = call.request.headers["auth_token"] ?: ""
            val diaryId = call.receiveParameters()["diary_id"] ?: ""

            if (users.containsValue(token)) {
                if (favorites.any { it.diaryId == diaryId }) {
                    favorites.removeIf { it.diaryId == diaryId }
                } else {
                    val currentTime = System.currentTimeMillis()
                    val timeFormated = SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(Date(currentTime))
                    favorites.add(FavoriteDiaryData(diaryId, timeFormated))
                }
                call.respond(
                    HttpStatusCode.OK,
                    FavoriteDiaryResponse(msg = "Success", data = FavoriteDiaryData())
                )
            } else {
                call.respond(
                    HttpStatusCode.Forbidden,
                    FavoriteDiaryResponse(msg = "UnAuthorized", data = FavoriteDiaryData())
                )
            }
        }

        get("/api/diary/collection") {
            val token = call.request.headers["auth_token"] ?: ""

            if (users.containsValue(token)) {
                call.respond(HttpStatusCode.OK, FavoriteDiaryGetResponse(msg = "Success", data = favorites))
            } else {
                call.respond(
                    HttpStatusCode.Forbidden,
                    FavoriteDiaryResponse(msg = "UnAuthorized", data = FavoriteDiaryData())
                )
            }
        }

        get("/api/diary") {
            val diaries = this::class.java.getResource("/diary/diaries.json")!!.readText()
            call.respondText(diaries, ContentType.Application.Json)
        }

        get("/api/{file}") {
            val fileName = call.parameters["file"] ?: return@get call.respond(HttpStatusCode.BadRequest, "Missing file")
            val resource = this::class.java.getResource("/diary/$fileName")
                ?: return@get call.respond(HttpStatusCode.NotFound, "File not found")

            val bytes = resource.readBytes()

            val contentType = when {
                fileName.endsWith(".json", true) -> ContentType.Application.Json
                fileName.endsWith(".jpg", true) -> ContentType.Image.JPEG
                else -> ContentType.Application.OctetStream
            }

            call.respondBytes(bytes, contentType)
        }

        get("/api/user-agreement") {
            val page = this::class.java.getResource("/user-agreement.html")!!.readText()
            call.respondText(page, ContentType.Text.Html)
        }
    }
}