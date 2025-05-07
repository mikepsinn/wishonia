# Welcome to Wishonia - Project Documentation

## Vision

Wishonia aims to be a dynamic platform connecting needs and wishes with innovative solutions, primarily driven by AI agents and human expertise. It fosters a collaborative ecosystem where individuals and organizations can articulate preferences, and providers can offer services, AI agents, or direct fulfillment. Wishonia is designed to operate on an economic model that strives for **Pareto optimal resource allocation** to achieve **maximum aggregate preference satisfaction (universal wish fulfillment)**. This model is centered around a gift economy, internal "$WISH," a fair transaction tax funding a Universal Basic Income (UBI) and public goods, all while empowering providers and enabling efficient problem-solving.

## Core Goals

*   **Maximize Universal Wish Fulfillment**: Enable users to define needs/wishes and receive diverse solution proposals within an economic framework designed for utilitarian outcomes and Pareto improvements, aiming to maximize aggregate preference satisfaction.
*   **AI-Driven Solutions for Optimal Utility**: Leverage AI agents to assist in generating solutions, breaking down projects, and matching needs with providers, guided by the goal of increasing overall preference satisfaction.
*   **Marketplace for Utility Exchange**:
    *   Users post needs/wishes (`WishingWells`).
    *   Providers (`GenieDAO`s or `User`s) offer services (`GenieServiceOffering`) and proposals (`WishFulfillmentProposal`), operating within both gift economy principles (utility-maximizing contributions) and an optional "$WISH" exchange system (for utility exchange).
    *   Tasks (`GlobalTask`s) can be outsourced (`TaskBid`s), potentially using $WISH.
*   **Provider Empowerment for a Paretopia**: Help solution providers (Genies) to:
    *   Find opportunities to contribute to wish fulfillment.
    *   Be fairly recognized or compensated (via reputation or $WISH) within the platform's utilitarian economy.
    *   Manage their offerings and track their impact on aggregate preference satisfaction.
*   **Streamlined Recruitment for Utility Contribution**: Facilitate recruitment focused on matching skills with opportunities that contribute to overall platform utility and wish fulfillment.
*   **Support for a Circular Utilitarian Economy**: Implement a fair transaction tax on $WISH exchanges to fund a Universal Basic Income (UBI) for platform members and provide for public goods. This aims to ensure a baseline of preference satisfaction and support contributions to the gift economy.
*   **Reputation and Feedback for Trust & Efficiency**: Maintain robust systems for reviews and feedback (`FulfillmentReview`, `GenieDAOFeedback`) to build trust and improve the efficiency of achieving a Paretopia.

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