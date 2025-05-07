# A Decentralized To-Do List for Humanity: Building a Utilitarian Paretopia

## ;TLDR

We envision a decentralized, semi-autonomous "To-Do List for Humanity" aiming for **Pareto optimal resource allocation** to achieve **maximum preference satisfaction (universal wish fulfillment)**. It will:
1. Identify large global problems and individual/collective wishes.
2. Use AI research agents to catalog all possible solutions and paths to wish fulfillment.
3. Recursively break down solutions/wishes into the smallest atomic tasks.
4. Fulfill these tasks through AI automation and efficient human collaboration, underpinned by an economic model designed for **utilitarian outcomes**.

### Core Goal
To maximize **aggregate preference satisfaction (universal wish fulfillment)** for all sentient beings, approaching a **Pareto optimal state** given limited resources. This is pursued by leveraging collective intelligence, AI agents, and an economic system designed for **maximum utility**, incorporating a gift economy, fair internal taxation for a Universal Basic Income (UBI), and mechanisms to avoid activity that demonstrably reduces aggregate well-being.

### How It Works
1. Collect individual and collective preferences (wishes) through [pairwise comparisons](#aggregated-pairwise-preference-allocation-appa) to understand the **utility landscape**.
2. Combine responses to create a crowdsourced understanding of resource allocation priorities that aims for Pareto improvements.
3. **AI Research Agents** catalog and rank potential solutions/paths based on their predicted contribution to aggregate preference satisfaction and cost-effectiveness.
4. **Goal Decomposition AI Agents** break down complex solutions/wishes into atomic tasks.
5. **Task Agents** identify skilled individuals, AI, or DAOs (`GenieDAO`s) to complete tasks efficiently, operating within:
    *   A **Gift Economy Layer**: Encouraging contributions that increase overall utility without direct quid-pro-quo.
    *   An **Internal Credit System ("$WISH")**: Facilitating exchanges for services/tasks, funded by a platform transaction tax (designed for minimal deadweight loss) and supporting a UBI (to ensure basic preference satisfaction for all participants).
6. **Monitor Agents** track progress and real-world impact on preference satisfaction levels, providing feedback to continuously improve the system towards a Paretopia.

### Core Components
1. **Digital Twins**: AI agents aligned to individual preferences and utility functions, operating to maximize their user's satisfaction within the system's rules.
2. **Positron Agents**: Prosocial AI dedicated to identifying and executing on public goods provision and Pareto improvements.
3. **Wishocracy**: A resource allocation protocol based on aggregated preferences, aiming for Pareto optimal outcomes.
    *   **Marketplace Module**: For connecting needs/wishes (`WishingWell`) with solutions/fulfillment (`WishFulfillmentProposal`) from `GenieDAO`s or `User`s.
    *   **Recruitment Module**: For matching talent (`Person`) with opportunities (`JobApplication`) that contribute to overall utility.
4. **Utilitarian Internal Economy**: Featuring "$WISH," a transaction tax for UBI and public goods, designed to maximize preference satisfaction, eliminate internal poverty, and avoid subsidizing activities that demonstrably reduce aggregate well-being (negative externalities).

### Features
1. Quantification of collective priorities aiming for maximum utility, using transparent preference aggregation.
2. AI-assisted cataloging of problems, wishes, and solutions, evaluated for their potential impact on aggregate preference satisfaction.
3. Decomposition of solutions/wishes into actionable tasks.
4. Skill-based and utility-maximizing task matching.
5. Reduced duplication of effort through transparent coordination.
6. Progress tracking and impact measurement focused on changes in preference satisfaction.
7. An internal economic model promoting Pareto improvements, fairness, and overall well-being.

## The Long Explanation: Towards a Utilitarian Paretopia

The core aspiration of Wishonia is not just to solve problems efficiently, but to create a system that **systematically strives for Pareto optimal resource allocation to achieve maximum aggregate preference satisfaction (universal wish fulfillment)**. This is a utilitarian framework aiming for the greatest good for the greatest number, while respecting the impossibility of making interpersonal utility comparisons perfectly by focusing on Pareto improvements where possible.

Traditional economic systems, while powerful, do not explicitly optimize for this. They often result in outcomes that are not Pareto optimal and can lead to significant disparities in preference satisfaction. They may also fail to adequately address public goods or account for negative externalities, thus not maximizing overall utility.

**Our Vision for Wishonia's Utilitarian Economy:**

We aim to build an alternative economic engine within our platform:

1.  **Gift Economy as a Utility-Maximizing Behavior**: Voluntary contributions are encouraged as they often represent actions where the contributor's utility of giving (or the recipient's utility gained) outweighs the cost to the contributor, leading to net positive utility.
2.  **"$WISH" - An Internal Medium for Utility Exchange**: For services/tasks where direct gifting is insufficient or a more formal exchange is preferred, "$WISH" facilitate these interactions. Their value is derived from their utility in accessing services and participating in the platform economy (including receiving UBI).
3.  **Fair Transaction Tax for Public Goods & UBI**: A small, transparent tax on $WISH-based transactions is designed to be minimally distortive while funding:
    *   **Universal Basic Income (UBI)**: Ensuring a baseline level of preference satisfaction for all participants, enabling broader participation and a more stable economic floor.
    *   **Public Goods Provision**: Funding for platform operations, development of shared AI tools, and other community-prioritized projects that increase overall utility and might be underprovided otherwise.
4.  **Avoiding Negative Externalities & Pareto Sub-Optimal Outcomes**: The system will strive to identify and disincentivize (or prevent) activities that demonstrably reduce aggregate preference satisfaction or move away from Pareto optimality. This includes minimizing reliance on external systems known to finance such negative externalities.
5.  **Community Governance for Utility Alignment**: Decisions regarding the economic parameters (tax rate, UBI levels, public goods funding) and operational guidelines will ideally be made through governance mechanisms designed to reflect the aggregate preferences of the community, constantly seeking Pareto improvements.

This economic model aims to create a **Paretopia** – a state where resources are allocated such that no individual's preference satisfaction can be improved without making at least one other individual's preference satisfaction worse, while continuously striving to expand the frontier of what's possible to satisfy more preferences overall.

## The Long Explanation

Say you want to solve a massive global problem like dementia, aging, animal suffering, etc.

**How can you determine the most efficient thing you can do with your time, energy, specific skills and resources to solve it?**

This is a serious question. 
Given the amount of death and suffering, it's probably the most serious question in the world.
So if you have an answer, 
skip reading the rest of this and [share it here](https://github.com/wishonia/wishonia/issues).

Otherwise, 
consider the fact that:
1. our brains have barely evolved since the time of the caveman 
2. we can hold only seven things in our working memory at a time
3. there are thousands of problems, with thousands of potential solutions, and ultimately billions of tasks that need to be completed to solve them

This is the proposed approach to addressing these challenges 
[(please update if you have a better idea)](https://github.com/wishonia/wishonia/edit/main/README.md):

1. List Problems - First, we need a list of global problems we're trying to solve.

2. Prioritize Problems - We don't have infinite resources, so we need a systematic way to determine the share of resources that should be allocated to solve each problem based on our values. 
This can be done using [Randomized Aggregated Pairwise Preference Allocation (APPA)](#aggregated-pairwise-preference-allocation-appa) or a better mechanism.

3. List All Possible Solutions - Use AI **Solution Cataloger Research Agents** (and humans) to research and compile an exhaustive list of potential solutions to a given problem.

4. Break Down Each Solution Into the Smallest Actionable Tasks - Use AI **Goal Decomposition Agents** to recursively break each solution into every single atomic task that needs to be completed to implement the solution.

5. Assign an AI agent to each task, so they can do one of the following:
   - **Identify** who's already working on the task 
   - **Automate** - have an AI agent complete the task (if possible) 
   - **Outsource** - have the agent identify the human or organization who can complete it as cheaply and quickly as possible

# Definitions

**Wishocracy** is a decentralized, modular, and interoperable protocol for optimally allocating societal resources to maximize universal wish fulfillment using collective intelligence. It's meant to be a general-purpose system to be used by any organization like nonprofits, DAOs, businesses, etc.

**Wishonia** is an imaginary magical kingdom meant to illustrate the concept of Wishocracy and test the idea in a simulated virtual world to see how it works.

# Quick Start

1. **Install Dependencies**:

   - [Node.js](https://nodejs.org/en/) v18 or higher (I'd recommend using [NVM](https://github.com/coreybutler/nvm-windows?tab=readme-ov-file) instead so you can easily switch nodejs versions as needed)
   - [pnpm](https://pnpm.io/)
   - [Docker](https://www.docker.com/)

2. **Configure Environment Variables**:

   - Rename .env.example files to .env and configure the environment variables

3. **Start the Database With Docker**:

```sh
docker-compose up -d
```

4. **Install Dependencies**:

```sh
pnpm install
```

5. **Seed the Database**:

Seed the database with default problems and wishes by running tests/seed.test.ts with the following command:

```sh
jest tests/seed.test.ts
```

# Why Are You Doing This?

**The most universal goal we all share is to
maximize the median health and happiness for sentient beings.**

As a human with this goal, you have a limited amount of time, energy, and resources to achieve it.

Unfortunately, there's a 99% chance that you're not doing it optimally.

Either:

- one of the other eight billion people on the planet is already doing what you're doing, and you're totally wasting your resources duplicating effort
- you're simply not doing the best thing that you could be doing, given your skills and resources

## Coordination Failure

The exponential coordination complexity problem illustrates how the lines of communication grow rapidly as more people are involved in a decision-making process.

![](public/img/coordination-complexity-node-graph.jpeg)

Each additional person significantly increases the total number of connections needed for effective communication. 
This complexity makes it impossible to make decisions efficiently, especially as group sizes increase.

![](public/img/coordination-complexity-exponential-graph.jpeg)

However, digital twin agents,
AI representations of individuals with higher cognitive bandwidth perfectly aligned to their preferences, 
can overcome these human limitations.

Agents can continuously analyze data, predict outcomes, and suggest optimal actions, 
ensuring that resources are allocated effectively and that collaborative efforts are maximized. 
This can lead to more informed decision-making, reduced friction in communication, 
and speed up progress towards our collective goals on a global scale.

# Solution: Collective Intelligence and Coordination

The best system we have for maximizing individual health and happiness is the free market.
It's a decentralized system that uses collective intelligence to maximize wish fulfillment.
It works by letting everyone vote with their dollars to determine what everyone should be doing for 40 hours a week.
It's able to coordinate thousands of people who don't even know each other exist to produce goods and services that are more complex than any one person could produce on their own.

The invisible hand kind of turns humanity into a magical genie
that can produce innovations indistinguishable from magic to people who lived before Adam Smith.

https://github.com/mikepsinn/wishonia/assets/2808553/95c056e1-ee9c-4e90-b956-4a2e60d3ad0a

# Public Goods

The free market works well for producing private goods like pencils and iPhones.
However, it doesn't work well for producing public goods like solutions to societal problems.

We make far less progress in solving these problems than we could because:

1. **We Lack a System for Prioritizing Allocation of Scarce Resources** -
   Society has limited resources and thousands of problems.
   We have democratic systems and proposals with up-down votes,
   but they don't force the recognition that resources allocated to one problem are no longer available to solve other problems.
2. **Inefficient Allocation** -
   Resources are often allocated based on political or emotional reasons rather than cost-effectiveness.
3. **Lack of Coordination** -
   There are many organizations working on the same problems without coordination.
   This leads to unimaginable levels of duplicated effort and waste.
4. **Lack of Accountability** -
   There's no way to track the impact of resources allocated to solving problems.
   This makes it difficult to determine what's working and what's not.
5. **Unintended Consequences** -
   Some solutions create new problems or have unintended side effects.
   Without tracking the impact of solutions, it's challenging to adjust resource allocation to minimize these effects.
6. **Limited Cognitive Capacity** -
   Humans have limited cognitive capacity
   and can't effectively weigh the relative importance of thousands of problems
   to determine the percentage of resources that should be allocated to each problem or wish.
7. **Lack of Transparency** -
   There's a lack of transparency in how resources are allocated to solve problems.
   This makes it difficult for citizens to hold decision-makers accountable.
8. **Lack of Incentives** -
   Decision-makers often lack incentives to allocate resources efficiently.
   They may be more focused on short-term political gains than long-term societal benefits.

# The Solution: A Wish Fulfillment System

The core components of a Wish Fulfillment System are:

1. **Problems or Wishes**: A comprehensive list of societal problems that need to be solved or wishes to be fulfilled.
2. **Budget**: A breakdown of the percentage of available resources to allocate to solving each problem/wish.
3. **Solutions**: A comprehensive list of proposed solutions to solve each problem or realize each wish.
   It's also necessary to consider the cost-effectiveness of each solution and unintended side effects.
   A solution may solve multiple problems or create new problems.
4. **Tasks**: A list of SMART (Specific, Measurable, Achievable, Relevant, Time-bound) tasks that need to be completed to implement each solution. Some tasks may contribute to multiple solutions.
5. **Solvers**: People/organizations responsible for completing each task.
6. **Progress**: Tracking the impact of each solution and adjusting resource allocation as needed.
7. **Results**: The outcomes of each solution and the overall positive and negative impact on society.

# The Wish Fulfillment Process

## Step 1. Catalog Wishes or Problems

Create a comprehensive list of societal goals or problems that need to be solved.

## Step 2. Create a Budget

Determine how much of our scarce resources should be allocated to solving each problem or fulfilling each wish.

There are a number of ways to do this like democracy and crowdfunding campaigns but they suffer from various limitations:

- **Democracy:** Some interests of representatives do not match the interests of all citizens. Additionally, representatives have limited knowledge and cognitive capacity to effectively weigh the relative importance of thousands of wishes.
- **Crowdfunding Campaigns:** People vote with their dollars to determine the allocation of resources. However, again humans have limited cognitive capacity to effectively weigh the relative importance of thousands of wishes.

### Aggregated Pairwise Preference Allocation (APPA)

A possible solution to this is **Aggregated Pairwise Preference Allocation (APPA)**.
This involves showing everyone a random pair of wishes or problems
and asking them to allocate a percentage of available resources to each.

![](public/img/screenshots/problem-allocation.png)

By aggregating lots of pairwise allocations from lots of people, we may be to determine the percentage of available resources that should be allocated to each problem.

![](public/img/screenshots/problem-allocation-list-with-heading.png)

## Step 3: Create a List of Solutions

Allow people or AI agents to submit proposed solutions for each problem
or wish to create a comprehensive list of proposed strategies to fulfill each wish or solve each problem.

## Step 4: Evaluate Solutions

Again, use collective intelligence through Aggregated Pairwise Preference Allocation to determine the percentage of problem resources that should be allocated to each solution.
The evaluators should take into account the:

- **cost-effectiveness** of each solution
- **positive side effects** of the solution in terms of solving other problems
- **negative side effects** of the solution in terms of creating new problems

## Step 5. Create Tasks

Decompose each solution into a list of atomic tasks that need to be completed.
Each task should be SMART (Specific, Measurable, Achievable, Relevant, Time-bound).

Some tasks may contribute to multiple solutions,
so it's important to link tasks to multiple solutions so that they are not duplicated and that costs are shared across solutions.

## Step 6. Create Prizes and Incentives

Offer rewards for completing tasks to incentivize the completion of tasks. This not only motivates individuals or AI agents to undertake and complete tasks but also promotes cost-sharing between multiple organizations. By doing so, we can prevent wasteful duplication of effort and resources, as multiple organizations can contribute to the reward pool for tasks that align with their objectives.

Possible ways to decide on the amount of the prize include:

- **Bidding:** People or AI agents bid on the tasks by submitting the amount they would be willing to accept to complete the task. This creates a competitive environment that can lead to more efficient task completion.
- **AI Prediction Markets:** Use AI to predict the cost of completing the task and offer a prize that is slightly higher than the predicted cost. This ensures that the task is attractive enough to be undertaken, while also keeping costs under control.

## Step 6. Evaluate Submissions

Evaluate the completed tasks to determine if they meet the criteria for completion and award the prize.

## Step 7. Monitor Progress and Impact

Track the impact of each solution.
Evaluate the outcomes of each solution and the overall positive and negative impact on society.

## Step 8. Feedback and Iterative Improvement

Provide impact data to people making pairwise allocations to help them make better decisions in the future.
This will enable continuous improvement in the allocation of resources to maximize wish fulfillment.

# How is Wishocracy Different from Other Systems?

- **Aggregated Pairwise Preference Allocation (APPA)**: This mechanism allows for scalable surfacing of the "wisdom of crowds" in budgeting resources across competing wishes/problems and evaluating potential solutions.
- **Iterative Feedback Loops**: The system should incorporate continuous improvement of allocations based on impact data and participant input.
- **Decentralized Task Allocation**: By decomposing solutions into atomic tasks and cost-sharing across multiple organizations, Wishocracy tries to minimize duplication of effort and maximize efficiency.

# Protocol

## Protocol Primitives

The current models are available in the [Prisma schema here](prisma/schema.prisma).
However, we'll ultimately want to define these as JSON schemas and switch to a decentralized data store for interoperability.

1. **Problem Statement (WPS)**

- Globally unique identifier
- Title (short description)
- Detailed description
- Category tags
- Creation timestamp
- Creator ID (DID or public key)

2. **Pairwise Allocation Vote (PAV)**

- Voter ID (DID or public key)
- Wish/Problem A ID
- Wish/Problem B ID
- Allocation percentage for A
- Allocation percentage for B
- Timestamp

3. **Solution Proposal (SP)**

- Globally unique identifier
- Associated Wish/Problem ID(s)
- Title
- Detailed description
- Estimated cost
- Estimated impact
- Category tags
- Creation timestamp
- Creator ID

4. **Task Definition (TD)**

- Globally unique identifier
- Associated Solution Proposal ID(s)
- SMART task specification
  - Title
  - Detailed description
  - Measurable completion criteria
  - Due date
- Estimated cost
- Dependent Task IDs
- Category tags
- Creation timestamp
- Creator ID

5. **Task Allocation Commitment (TAC)**

- Allocated Task Definition ID
- Solver ID
- Committed budget
- Acceptance timestamp

6. **Task Submission (TS)**

- Allocated Task Definition ID
- Solver ID
- Deliverable data/proof
- Submission timestamp

7. **Task Evaluation Result (TER)**

- Task Submission ID
- Evaluator ID
- Evaluation score
- Evaluation notes
- Evaluation timestamp

8. **Impact Report (IR)**

- Associated Solution Proposal ID(s)
- Reporting period
- Impact metrics
  - Quantitative measures
  - Qualitative outcomes
- Associated Task Submission IDs
- Report timestamp
- Reporter ID

# Integration and Interoperability

These primitives can be represented as standardized data schemas that can be stored, queried, and interlinked across disparate systems via decentralized data networks like IPFS, GUN, Ceramic, etc.

Existing task management or resource allocation platforms can map their internal data models to these common primitives, and publish/subscribe to relevant data streams. This allows different systems to coordinate on a global "task graph" without tight coupling.

Some example integration patterns:

- A DAO's internal project management system can automatically generate Task Definitions from its own tasks/issues/bounties and publish them for external contributors to submit Task Allocation Commitments and Task Submissions.
- A public goods crowdfunding platform can post funded initiatives as Solution Proposals, and allocate a portion of the raised funds to Task Definitions drawn from Wishocracy's task graph.
- An analytics platform can aggregate Impact Reports from multiple sources to surface insights on global resource allocation efficiency and identify neglected areas or emerging opportunities.

By defining these common primitives and leveraging decentralized data networks, Wishocracy can serve as a connective tissue that enables various task management and resource allocation systems to interoperate towards the shared goal of optimizing global effort, without requiring disruptive changes to their existing workflows.

# General Functions of Wishocracy

1. **Wish Management System**: A system for creating, categorizing, and prioritizing wishes or problems that need to be solved.
2. **Budget Allocation System**: A system for determining how much of our scarce resources should be allocated to solving each problem or fulfilling each wish.
3. **Solution Management System**: A system for creating, categorizing, and evaluating proposed solutions to solve each problem or fulfill each wish.
4. **Task Management System**: A system for decomposing each solution into a list of atomic tasks that need to be completed.
5. **Wisher Relationship Management (WRM) System**: A system for tracking the relationship between wishes, solutions, tasks, and wishers. This is similar to a Customer Relationship Management (CRM) system but for global coordination between Wishers.

# Digital Twins

We'd like to allow people to create Digital Twins of themselves in the simulated World of Wishonia.
Digital Twins are meant to be autonomous agents to work together to find positive-sum games,
figure out how their analog real-world counterparts can work together to maximize wish fulfillment.
They should also be able to use tools and interact with the world to automate the production of public goods.

A Digital Twin is a digital representation of a person that is defined by their:

- **Wishes**: What they want to accomplish in the world
- **Skills**: What they're good at
- **Resources**: What they have to offer
- **Interests**: What they're interested in
- **Time**: How much time they have to offer

The basic technical ingredients of a digital twin are:

- **A Large Language Model**: To understand and generate text
- **A Knowledge Graph**: To store and reason about the person's wishes, skills, resources, interests, time, reputation, network, location, and language
- **A Vector Database**: To store and query the person's knowledge graph using retrieval

# What's Next?

1. **Integrate Existing Public Goods Protocols and Platforms**:
   Integrate protocols that aim to optimize resource allocation such as Gitcoin Grants, HyperCerts, and others.
2. **Domain Application**: Exploring applications of Wishocracy within various contexts such as organizations, DAOs, governments, or global scale initiatives.
3. **Integration with Existing Task Management Systems**: Developing integrations with existing task management systems to facilitate task import, syncing, creation, assignment, and tracking.

# [Frequently Asked Questions](public/docs/faq.md)

