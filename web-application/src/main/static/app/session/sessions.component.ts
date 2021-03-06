import {Component, enableProdMode, OnInit, Input, OnChanges, SimpleChanges} from "@angular/core";
import {Router, ActivatedRoute, Params} from "@angular/router";
import {Session} from "./session";
import {SessionService} from "./session.service";
import {Speaker} from "../speaker/speaker";
import {AuthService} from "../shared/auth.service";

//enableProdMode();

@Component({
    selector: 'sessions',
    templateUrl: 'app/session/sessions.component.html'
})
export class SessionsComponent implements OnInit, OnChanges {
    title = 'Sessions';
    sessions: Session[];
    selectedSession: Session;
    search: string;
    auth: AuthService;
    showJwtDialog: boolean = false;
    @Input() speaker: Speaker;

    constructor(private router: Router, private route: ActivatedRoute, private sessionService: SessionService, auth: AuthService) {
        console.log("SessionsComponent.ctor");
        this.auth = auth;
    }

    getSessions(): void {
        console.log("SessionsComponent.getSessions");
        this.sessionService.getSessions()
            .then(sessions => {
                this.sessions = sessions;
                this.title = "Sessions["+sessions.length+"]";
            })
            .catch(SessionsComponent.handleError);
    }

    ngOnInit(): void {
        let _self = this;
        this.sessionService.init(function () {
            _self.getSessions();

            _self.route.params.forEach((params: Params) => {
                _self.onSelectId(params['id']);
            });
        });

    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['speaker'].currentValue != changes['speaker'].previousValue) {
            console.log("Reset selected session");
            this.selectedSession = null;
        }
    }

    onSelect(session: Session): void {
        console.log("onSelect(session: %s)", session);
        this.selectedSession = session;
    }

    onSearch(search: string): void {
        this.search = search;
    }

    onSelectId(any: any): void {
        this.sessionService.getSessionsById([any as string]).then(session => this.onSelect(session[0]));
    }

    gotoDetail(): void {
        this.router.navigate(['/detail', this.selectedSession.id]);
    }

    logout(): void {
        this.auth.logout();
        this.sessionService.clear();
        console.log("logged out, navigating back to /");
        this.router.navigateByUrl("/login");
    }

    refresh() {
        console.log("refreshing sessions...");
        this.sessions = null;
        this.sessionService.clear();
        this.getSessions();
    }

    private static handleError(error: any): Promise<any> {
        console.error('An error occurred', error); // TODO - Display safe error
        return Promise.reject(error.message || error);
    }
}
