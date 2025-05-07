# Welcome to Wishonia - Project Documentation

## Vision

Wishonia aims to be a dynamic platform connecting needs with innovative solutions, primarily driven by AI agents and human expertise. It fosters a collaborative ecosystem where individuals, organizations (including businesses, non-profits, and government entities) can articulate challenges or wishes, and providers can offer services, AI agents, or direct fulfillment. The platform is designed to empower providers to optimize their efforts, particularly their revenue per hour, while enabling efficient problem-solving, seamless task outsourcing, and effective recruitment.

## Core Goals

*   **Efficient Problem Solving**: Enable users to define needs (from personal wishes to complex organizational challenges) and receive diverse solution proposals.
*   **AI-Driven Solutions**: Leverage AI agents to assist in generating solution ideas, breaking down complex projects into actionable tasks, and matching needs with providers.
*   **Marketplace for Services & Solutions**: Create a vibrant marketplace where:
    *   "Wishers" can post their needs/desires (`WishingWells`).
    *   "Genies" (`GenieDAO`s or individual `User`s) can offer their services or pre-defined AI agent solutions (`GenieServiceOffering`) and submit proposals (`WishFulfillmentProposal`).
    *   Tasks derived from accepted proposals can be further outsourced (`GlobalTask`s via `TaskBid`s).
*   **Provider Empowerment**: Help solution providers (Genies) to:
    *   Generate leads for their services.
    *   Optimize their revenue per hour through efficient proposal and fulfillment processes.
    *   Manage their service offerings and track their success.
*   **Streamlined Recruitment**: Facilitate a recruitment module where:
    *   Organizations can post job opportunities (as a type of `WishingWell`).
    *   Candidates (`Person`) can showcase their profiles and apply for roles (`JobApplication`).
*   **Collaborative Task Management**: Allow for detailed task breakdown (`GlobalTask`) and assignment (`UserTask`) for accepted projects.
*   **Reputation and Feedback**: Implement systems for reviews and feedback (`FulfillmentReview`, `GenieDAOFeedback`) to build trust and quality.

## Platform Structure Overview

The Wishonia platform is built around several key interconnected modules:

1.  **Core Entities**:
    *   `User`: Individual participants on the platform.
    *   `Person`: Represents human individuals, whether they are platform users, candidates, or contacts.
    *   `Organization`: Represents various entities like businesses, non-profits, or government bodies.
    *   `Sector`: Categorizes needs and organizational domains.
    *   `ServiceCategory`: Categorizes the types of services or AI agents offered.

2.  **Marketplace Module**:
    *   Manages the lifecycle of needs (`WishingWell`) from posting to fulfillment.
    *   Supports providers (`GenieDAO`, `User`) in offering services (`GenieServiceOffering`) and making proposals (`WishFulfillmentProposal`).
    *   Includes mechanisms for task breakdown (`GlobalTask`) and outsourcing (`TaskBid`).
    *   Detailed documentation: [Marketplace Module](./marketplace.md)

3.  **Recruitment Module**:
    *   Allows organizations to post job openings (`WishingWell` adapted for jobs).
    *   Enables candidates (`Person`) to apply for these roles (`JobApplication`).
    *   Detailed documentation: [Recruitment Module](./recruitment.md)

4.  **Task Management**:
    *   The `GlobalTask` system is used across modules for breaking down work from accepted proposals or internal projects.

5.  **AI Agent Integration (Envisioned)**:
    *   AI agents are expected to play roles in:
        *   Assisting users in drafting needs/wishes and job descriptions.
        *   Helping providers draft proposals and service offerings.
        *   Matching needs with suitable providers or candidates.
        *   Automating task breakdown for complex projects.
        *   Facilitating communication and scheduling.

## Navigating the Documentation

Please use the links above to explore the detailed documentation for each module. Each section will further explain the key entities, user flows, and data relationships, including Mermaid diagrams where appropriate. 