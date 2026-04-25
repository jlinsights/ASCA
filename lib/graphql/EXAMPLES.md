# GraphQL API Examples

Complete examples for using the ASCA GraphQL API.

## Endpoint

```
POST /api/graphql
```

## Authentication

Include JWT token in Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Query Examples

### 1. Get Current User

```graphql
query GetMe {
  me {
    id
    email
    name
    role
    avatar
    createdAt
  }
}
```

### 2. Get Member by ID

```graphql
query GetMember($id: ID!) {
  member(id: $id) {
    id
    membershipNumber
    fullName
    fullNameKo
    status
    tierLevel
    joinDate

    # Relations
    user {
      id
      email
      name
    }

    tier {
      id
      nameKo
      nameEn
      level
      annualFee
    }

    # Calligraphy Info
    calligraphyExperience
    specializations
    preferredStyles
    achievements
  }
}
```

Variables:

```json
{
  "id": "member-123"
}
```

### 3. List Members with Pagination

```graphql
query ListMembers($first: Int, $after: String, $status: MemberStatus) {
  members(first: $first, after: $after, status: $status) {
    edges {
      node {
        id
        membershipNumber
        fullName
        fullNameKo
        status
        tierLevel
        joinDate

        tier {
          nameKo
          level
        }
      }
      cursor
    }

    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }

    totalCount
  }
}
```

Variables:

```json
{
  "first": 20,
  "after": null,
  "status": "ACTIVE"
}
```

### 4. Search Members

```graphql
query SearchMembers($query: String!, $limit: Int) {
  searchMembers(query: $query, limit: $limit) {
    id
    membershipNumber
    fullName
    fullNameKo
    fullNameEn
    status
    tierLevel
  }
}
```

Variables:

```json
{
  "query": "김",
  "limit": 10
}
```

### 5. Get Membership Tiers

```graphql
query GetMembershipTiers($isActive: Boolean) {
  membershipTiers(isActive: $isActive) {
    id
    name
    nameKo
    nameEn
    level
    description
    descriptionKo
    annualFee
    currency
    requirements
    benefits
    color
    icon
  }
}
```

### 6. Get Artist with Artworks

```graphql
query GetArtist($id: ID!) {
  artist(id: $id) {
    id
    name
    nameKo
    nameEn
    bio
    bioKo
    birthYear
    nationality
    profileImage
    website

    # Relations
    artworks {
      id
      title
      titleKo
      category
      imageUrl
      year
      isFeatured
      isForSale
      price
      currency
    }

    exhibitionParticipations {
      role
      exhibition {
        id
        title
        titleKo
        type
        status
        startDate
        endDate
      }
    }
  }
}
```

Variables:

```json
{
  "id": "artist-123"
}
```

### 7. List Artworks with Filters

```graphql
query ListArtworks(
  $first: Int
  $category: ArtworkCategory
  $isFeatured: Boolean
  $isForSale: Boolean
) {
  artworks(
    first: $first
    category: $category
    isFeatured: $isFeatured
    isForSale: $isForSale
  ) {
    edges {
      node {
        id
        title
        titleKo
        titleEn
        description
        category
        style
        medium
        dimensions
        year
        imageUrl
        imageUrls
        price
        currency
        isForSale
        isFeatured
        tags

        # Artist info
        artist {
          id
          name
          nameKo
          profileImage
        }
      }
      cursor
    }

    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

Variables:

```json
{
  "first": 20,
  "category": "CALLIGRAPHY",
  "isFeatured": true
}
```

### 8. Get Exhibition Details

```graphql
query GetExhibition($id: ID!) {
  exhibition(id: $id) {
    id
    title
    titleKo
    titleEn
    description
    descriptionKo
    type
    status
    venue
    venueAddress
    startDate
    endDate
    openingHours
    admissionFee
    currency
    posterImage
    galleryImages
    isFeatured

    # Artworks in exhibition
    artworks {
      displayOrder
      isHighlight
      artwork {
        id
        title
        titleKo
        imageUrl
        artist {
          name
          nameKo
        }
      }
    }

    # Participating artists
    artists {
      role
      artist {
        id
        name
        nameKo
        profileImage
      }
    }
  }
}
```

### 9. Get Current/Upcoming Exhibitions

```graphql
query GetExhibitions {
  currentExhibitions {
    id
    title
    titleKo
    type
    status
    startDate
    endDate
    venue
    posterImage
  }

  upcomingExhibitions(limit: 5) {
    id
    title
    titleKo
    type
    startDate
    endDate
    venue
    posterImage
  }
}
```

### 10. Get Events

```graphql
query GetEvents($first: Int, $type: EventType, $status: EventStatus) {
  events(first: $first, type: $type, status: $status) {
    edges {
      node {
        id
        title
        titleKo
        description
        type
        status
        venue
        startDate
        endDate
        registrationDeadline
        maxParticipants
        currentParticipants
        fee
        currency
        posterImage

        # Organizer
        organizer {
          id
          name
        }
      }
    }

    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

Variables:

```json
{
  "first": 10,
  "type": "WORKSHOP",
  "status": "UPCOMING"
}
```

---

## Mutation Examples

### 1. Create Member

```graphql
mutation CreateMember($input: CreateMemberInput!) {
  createMember(input: $input) {
    id
    membershipNumber
    fullName
    status
    tierLevel
    joinDate
  }
}
```

Variables:

```json
{
  "input": {
    "userId": "user-123",
    "fullName": "김서예",
    "dateOfBirth": "1990-01-15T00:00:00Z",
    "gender": "FEMALE",
    "nationality": "KR",
    "phoneNumber": "+82-10-1234-5678",
    "address": "서울특별시 강남구",
    "city": "서울",
    "country": "KR",
    "calligraphyExperience": 5,
    "specializations": ["kaishu", "xingshu"]
  }
}
```

### 2. Update Member

```graphql
mutation UpdateMember($id: ID!, $input: UpdateMemberInput!) {
  updateMember(id: $id, input: $input) {
    id
    fullName
    fullNameKo
    phoneNumber
    calligraphyExperience
    specializations
    updatedAt
  }
}
```

Variables:

```json
{
  "id": "member-123",
  "input": {
    "fullNameKo": "김서예",
    "phoneNumber": "+82-10-9999-8888",
    "calligraphyExperience": 7,
    "specializations": ["kaishu", "xingshu", "caoshu"]
  }
}
```

### 3. Approve Member (Admin Only)

```graphql
mutation ApproveMember($id: ID!) {
  approveMember(id: $id) {
    id
    status
    updatedAt
  }
}
```

Variables:

```json
{
  "id": "member-123"
}
```

### 4. Submit Membership Application

```graphql
mutation SubmitApplication($input: MembershipApplicationInput!) {
  submitMembershipApplication(input: $input) {
    id
    memberId
    requestedTierLevel
    applicationType
    applicationReason
    status
    submittedAt
  }
}
```

Variables:

```json
{
  "input": {
    "memberId": "member-123",
    "requestedTierLevel": 3,
    "applicationType": "tier_upgrade",
    "applicationReason": "5년 이상 활동, 다수 전시 참여",
    "supportingDocuments": [
      "https://example.com/certificate1.pdf",
      "https://example.com/certificate2.pdf"
    ]
  }
}
```

### 5. Create Artist

```graphql
mutation CreateArtist($input: CreateArtistInput!) {
  createArtist(input: $input) {
    id
    name
    nameKo
    nameEn
    bio
    nationality
    profileImage
    isActive
  }
}
```

Variables:

```json
{
  "input": {
    "userId": "user-123",
    "name": "Kim Seoyae",
    "nameKo": "김서예",
    "nameEn": "Kim Seoyae",
    "bio": "Contemporary calligraphy artist",
    "birthYear": 1975,
    "nationality": "KR",
    "profileImage": "https://example.com/profile.jpg",
    "website": "https://kimseoyae.com"
  }
}
```

### 6. Create Artwork

```graphql
mutation CreateArtwork($input: CreateArtworkInput!) {
  createArtwork(input: $input) {
    id
    title
    titleKo
    category
    style
    medium
    year
    imageUrl
    isForSale
    price
    currency
  }
}
```

Variables:

```json
{
  "input": {
    "artistId": "artist-123",
    "title": "Harmony in Brushstrokes",
    "titleKo": "화합의 붓질",
    "titleEn": "Harmony in Brushstrokes",
    "description": "Contemporary calligraphy exploring traditional Korean aesthetics",
    "category": "CALLIGRAPHY",
    "style": "kaishu",
    "medium": "Ink on paper",
    "dimensions": "100 x 150 cm",
    "year": 2024,
    "imageUrl": "https://example.com/artwork.jpg",
    "price": 5000000,
    "isForSale": true,
    "isFeatured": false,
    "tags": ["contemporary", "traditional", "korean"]
  }
}
```

### 7. Register for Event

```graphql
mutation RegisterForEvent($eventId: ID!, $notes: String) {
  registerForEvent(eventId: $eventId, notes: $notes) {
    id
    status
    registeredAt

    event {
      title
      titleKo
      startDate
    }

    user {
      name
      email
    }
  }
}
```

Variables:

```json
{
  "eventId": "event-123",
  "notes": "Interested in advanced calligraphy techniques"
}
```

### 8. Cancel Event Registration

```graphql
mutation CancelRegistration($participantId: ID!) {
  cancelEventRegistration(participantId: $participantId)
}
```

Variables:

```json
{
  "participantId": "participant-123"
}
```

---

## Complex Query Examples

### Combined Member Dashboard Query

```graphql
query MemberDashboard($memberId: ID!) {
  member(id: $memberId) {
    id
    membershipNumber
    fullName
    fullNameKo
    status
    tierLevel
    joinDate
    participationScore
    contributionScore
    profileCompleteness

    # Tier info
    tier {
      nameKo
      level
      annualFee
      benefits
    }

    # Recent activities
    activities {
      activityType
      description
      points
      timestamp
    }

    # Certifications
    certifications {
      title
      titleKo
      issuingAuthority
      issuedAt
      status
    }

    # Applications
    applications {
      requestedTierLevel
      status
      submittedAt
      reviewComments
    }
  }

  # Upcoming events
  upcomingEvents(limit: 5) {
    id
    title
    titleKo
    type
    startDate
    venue
  }

  # Current exhibitions
  currentExhibitions {
    id
    title
    titleKo
    posterImage
    startDate
    endDate
  }
}
```

### Artist Portfolio Query

```graphql
query ArtistPortfolio($artistId: ID!) {
  artist(id: $artistId) {
    id
    name
    nameKo
    nameEn
    bio
    bioKo
    birthYear
    nationality
    profileImage
    website
    specialties
    awards

    # All artworks
    artworks {
      id
      title
      titleKo
      category
      style
      year
      imageUrl
      isForSale
      isFeatured
      price
      currency
    }

    # Exhibition history
    exhibitionParticipations {
      role
      exhibition {
        title
        titleKo
        type
        startDate
        endDate
        venue
      }
    }
  }
}
```

---

## Error Handling

GraphQL errors are returned in the `errors` array:

```json
{
  "errors": [
    {
      "message": "Authentication required",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ],
  "data": null
}
```

Common error codes:

- `UNAUTHENTICATED`: Not logged in
- `FORBIDDEN`: Insufficient permissions
- `BAD_USER_INPUT`: Invalid input data
- `NOT_FOUND`: Resource not found
- `INTERNAL_SERVER_ERROR`: Server error

---

## GraphQL Playground (Development Only)

Visit http://localhost:3000/api/graphql in your browser to access the
interactive GraphQL Playground.

Features:

- Auto-complete
- Schema documentation
- Query history
- Variable editor

---

## Performance Tips

1. **Use DataLoader**: Relations are automatically batched using DataLoader to
   prevent N+1 queries

2. **Request Only Needed Fields**: Only query fields you need to reduce response
   size

3. **Use Pagination**: Use cursor-based pagination for large lists

4. **Cache Results**: GraphQL responses can be cached on the client

5. **Batch Multiple Queries**: Combine multiple queries in one request:

```graphql
query Dashboard {
  me {
    id
    name
  }

  currentExhibitions {
    id
    title
  }

  upcomingEvents(limit: 5) {
    id
    title
  }
}
```

---

## Next Steps

- Implement subscriptions for real-time updates
- Add more complex filters and sorting options
- Implement file upload mutations
- Add batch operations for admin tasks
- Set up GraphQL Code Generator for TypeScript types
