import { CategoryCard } from "../components/CategoryCard";
import { FaqItem } from "../components/FaqItem";

export const Ayuda = () => {

    return (
        <div className="container py-4">

            <div className="bg-success bg-opacity-10 rounded-4 p-5 text-center mb-5">
                <p className="text-success fw-bold text-uppercase small mb-2">Help center</p>
                <h1 className="fw-bold mb-3">How can we help?</h1>
                <p className="text-secondary mb-4">
                    Search your question or check the most common ones below.
                </p>

                <div className="d-flex gap-2 justify-content-center">
                    <input
                        type="text"
                        className="form-control w-50"
                        placeholder="Search: how do I commit, how to register a shelter..."
                    />
                    <button className="btn btn-success">Search</button>
                </div>
            </div>

            <div className="row g-4 mb-5">

                <CategoryCard
                    bgClass="bg-success"
                    title="Collaborating with a need"
                    description="How to commit, what happens if you're late, and how to cancel."
                    link="/necesidades"
                />

                <CategoryCard
                    bgClass="bg-warning"
                    title="Adopting an animal"
                    description="Requirements, how to send a request, and what happens next."
                    link="/adoptar"
                />

                <CategoryCard
                    bgClass="bg-info"
                    title="I'm a shelter"
                    description="Signing up, posting needs, and confirming deliveries."
                    link="/protectoras"
                />

                <CategoryCard
                    bgClass="bg-danger"
                    title="My account"
                    description="Password, personal data, and how to close your account."
                    link="/ayuda"
                />

            </div>

            <h2 className="fw-bold mb-1">Frequently asked questions</h2>
            <p className="text-secondary mb-4">What people ask us the most</p>

            <div className="d-flex gap-2 flex-wrap mb-4">
                <button className="btn btn-success btn-sm rounded-pill">All</button>
                <button className="btn btn-outline-secondary btn-sm rounded-pill">Collaborating</button>
                <button className="btn btn-outline-secondary btn-sm rounded-pill">Adopting</button>
                <button className="btn btn-outline-secondary btn-sm rounded-pill">Shelters</button>
                <button className="btn btn-outline-secondary btn-sm rounded-pill">Account</button>
            </div>

            <div className="mb-5">

                <FaqItem
                    question="What does it mean to 'commit' to a need?"
                    answer="When a shelter posts that they need 20kg of food, you can reserve the part you're going to bring, like 5kg. That amount is set aside so no one else covers it."
                />

                <FaqItem
                    question="What if I commit and then can't bring it?"
                    answer="No problem. You can cancel your commitment from My Activity, and the amount becomes available again right away."
                />

                <FaqItem
                    question="Can I donate money directly?"
                    answer="We don't handle payments. For financial needs, you'll see the shelter's contact details to transfer directly to them."
                />

                <FaqItem
                    question="How do I register my shelter?"
                    answer="Create an account choosing the 'I'm a shelter' option and fill in your details: name, address, and contact phone."
                />

                <FaqItem
                    question="I sent an adoption request and haven't heard back"
                    answer="Shelters review requests based on their availability. You can check the status anytime in My Activity."
                />

                <FaqItem
                    question="I forgot my password"
                    answer="On the login screen, click 'Forgot your password?', enter your email, and we'll send you a link to create a new one."
                />

                <FaqItem
                    question="Can I have a collaborator and a shelter account at the same time?"
                    answer="Not with the same email. Each account has a single role. If you want both, create a second account with a different email."
                />

            </div>

        </div>
    );
};