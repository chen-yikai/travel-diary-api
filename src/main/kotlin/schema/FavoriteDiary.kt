package dev.eliaschen.schema

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class FavoriteDiaryResponse(
    val msg: String,
    val data: FavoriteDiaryData
)

@Serializable
data class FavoriteDiaryData(
    @SerialName("diary_id") val diaryId: String = "",
    @SerialName("favorite_datetime") val favoriteDateTime: String = ""
)

@Serializable
data class FavoriteDiaryGetResponse(
    val msg: String,
    val data: List<FavoriteDiaryData>
)
