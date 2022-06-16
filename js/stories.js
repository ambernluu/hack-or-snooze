"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDeleteBtn = false) {
  //console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  const showStar = Boolean(currentUser);
  return $(`
      <li id="${story.storyId}">
      ${showDeleteBtn ? getDeleteBtnHTML() : ""}
      ${showStar ? displayFavorited(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}
function displayFavorited(story, currentUser) {
  const isFavorite = currentUser.isFavorite(story);
  const star = isFavorite ? "bi bi-star-fill blue-color" : "bi bi-star-fill";
  return `<button type="button" class="btn btn-link"><span class="${star}"></span></button>`;
}
/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();
  $favoritedStories.hide();
  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}
function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  $ownStories.empty();

  if (currentUser.ownStories.length != 0) {
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story, true);
      $ownStories.append($story);
    }
  }
  $ownStories.show();
}
async function submitStory(evt) {
  console.debug("SubmitStory");
  evt.preventDefault();

  const title = $("#new-title").val();
  const author = $("#new-author").val();
  const url = $("#new-url").val();
  const username = currentUser.username;
  const storyData = { title, url, author, username };
  const story = await storyList.addStory(currentUser, storyData);

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

}

$newStorySubmit.on("submit", submitStory);

async function toggleFav(evt) {
  console.debug("toggleFav");
  const $target = $(evt.target);
  const $closestLi = $target.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);
  console.log(`targetclass= ${evt.target.className}`);
  
  // if already favorited, remove from favorites
  if (evt.target.className === "bi bi-star-fill blue-color") {
    await currentUser.removeFavorite(story);
    $target.closest("span").toggleClass("blue-color");
  }
  //else make favorite
  else {
    await currentUser.favorite(story);
    $target.closest("span").toggleClass("blue-color");
  }
}
$allStoriesList.on('click', ".btn", toggleFav);

function userFavorites() {
  console.debug("userFavorites");

  $favoritedStories.empty();
  console.log(currentUser.favorites);
  if (currentUser.favorites.length != 0) {
    console.log('there is atleast 1 story here');
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  }
  $favoritedStories.show();
}
function userStories() {
  console.debug("userStories");

  $ownStories.empty();

  if (currentUser.ownStories.length != 0) {
    for (let story of currentUser.ownStories) {
      let $story = generateStoryMarkup(story, true);
      $ownStories.append($story);
    }
 
  }  $ownStories.show();
}
function getDeleteBtnHTML() {
  return `
      <span class="trash-can">
        <i class="bi bi-trash"></i>
      </span>`;
}
async function deleteStory(evt) {
  console.debug("deleteStory");

  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");

  await storyList.removeStory(currentUser, storyId);

  // re-generate story list
  await putUserStoriesOnPage();
}

$ownStories.on("click", ".trash-can", deleteStory);